import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { UnknownRequestVerb } from '../errors/UnknownRequestVerb'

import axios, { AxiosResponse, AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import FormData from 'form-data'
import { WrappedResponse } from '../types/WrappedResponse'
import { demandEnvVar, RowanTreeAuthServiceClient, Token, TokenClaims } from 'rowantree.auth.typescript.sdk'
import { getHeaders, setClaims, setHeader } from '../common/utils/AuthContext'

// https://github.com/axios/axios/issues/3612
export function isAxiosError (error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

export abstract class AbstractCommand<TRequestDataType, TResponseDataType> {
  public readonly retryOptions: RetryOptions
  readonly #authClient: RowanTreeAuthServiceClient

  public constructor (authClient: RowanTreeAuthServiceClient, retryOptions?: RetryOptions) {
    this.retryOptions = (retryOptions != null) ? retryOptions : { sleepTime: 1, retryCount: 5 }
    this.#authClient = authClient
  }

  protected async auth (): Promise<void> {
    const token: Token = await this.#authClient.authUser(demandEnvVar('ACCESS_USERNAME'), demandEnvVar('ACCESS_PASSWORD'))
    const claims: TokenClaims = this.#authClient.decodeJwt(token.accessToken)
    setHeader('Authorization', `Bearer ${token.accessToken}`)
    setClaims(claims)
  }

  protected async buildConfig (wrappedRequest: WrappedRequest<TRequestDataType>): Promise<AxiosRequestConfig> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }
    const headers: AxiosRequestHeaders = getHeaders()

    const config: AxiosRequestConfig = {
      timeout: wrappedRequest.timeout * 1000,
      headers
    }

    return config
  }

  protected async invokeRequest (wrappedRequest: WrappedRequest<TRequestDataType>, retryOptions?: RetryOptions): Promise<WrappedResponse<TResponseDataType>> {
    let response: AxiosResponse
    const wrappedResponse: WrappedResponse<TResponseDataType> = {}

    // Use the passed in options, otherwise go to the defaults.
    retryOptions = (retryOptions != null) ? retryOptions : { ...this.retryOptions }

    if (retryOptions.retryCount < 1) {
      // We've exceeded our retries, we will return an empty wrapped response.  The command can decide how to handle this scenario.
      return wrappedResponse
    }
    retryOptions.retryCount--

    try {
      const config: AxiosRequestConfig = await this.buildConfig(wrappedRequest)
      switch (wrappedRequest.verb) {
        case RequestVerbType.GET: {
          response = await axios.get(wrappedRequest.url, config)
          break
        }
        case RequestVerbType.POST: {
          response = await axios.post(wrappedRequest.url, wrappedRequest.data, config)
          break
        }
        case RequestVerbType.POST_FORM: {
          const form: FormData = new FormData()

          for (const key of Object.keys(wrappedRequest.data as Record<string, string>)) {
            const value: string = (wrappedRequest.data as Record<string, string>)[key]
            form.append(key, value)
          }

          response = await axios.post(wrappedRequest.url, form, config)
          break
        }
        case RequestVerbType.DELETE: {
          response = await axios.delete(wrappedRequest.url, config)
          break
        }
        default: {
          throw new UnknownRequestVerb(wrappedRequest.verb)
        }
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.status !== undefined) {
          if (wrappedRequest.statuses.allow.includes(error.response?.status)) {
            // Review success cases (Which might be exception inducing, 4xx, etc)
            // The payload could be anything, probable error details.
            console.log(error.response?.data)
            wrappedResponse.status = error.response?.status
            wrappedResponse.code = error.code
            return wrappedResponse
          } else if (wrappedRequest.statuses.retry.includes(error.response?.status)) {
            // Review failure cases
            console.log(`Received a retryable (${retryOptions.retryCount}) status code (${error.response?.status}), trying ...`)
            await this.delay(retryOptions.sleepTime)
            return await this.invokeRequest(wrappedRequest, retryOptions)
          } else if (wrappedRequest.statuses.reauth.includes(error.response?.status)) {
            // we are in a reauth status
            await this.delay(retryOptions.sleepTime)
            await this.auth()
            return await this.invokeRequest(wrappedRequest, retryOptions)
          } else {
            console.log(`Not retrying after receiving status code (${error.response?.status}).`)
            wrappedResponse.status = error.response?.status
            wrappedResponse.code = error.code
            return wrappedResponse
          }
        } else {
          console.log(`Failed to make request (${retryOptions.retryCount}) code (${String(error.code)}) (${JSON.stringify(error)}), trying ...`)
          await this.delay(retryOptions.sleepTime)
          return await this.invokeRequest(wrappedRequest, retryOptions)
        }
      }
      // We encountered some kind of non-axios error..
      throw error
    }

    if (wrappedRequest.statuses.allow.includes(response.status)) {
      wrappedResponse.data = response.data
      wrappedResponse.status = response.status
      return wrappedResponse
    }

    // We succeeded with the axios request but did not get a success -or failure-- status code.
    return wrappedResponse
  }

  private async delay (seconds: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
}
