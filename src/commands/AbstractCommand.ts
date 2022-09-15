import { RetryOptions } from '../types/RetryOptions'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { UnknownRequestVerb } from '../errors/UnknownRequestVerb'

import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios'
import FormData from 'form-data'
import { WrappedResponse } from '../types/WrappedResponse'
import { demandEnvVar, RowanTreeAuthServiceClient, Token, TokenClaims } from 'rowantree.auth.typescript.sdk'
import { getHeaders, setClaims, setHeader } from '../common/AuthContext'
import { ResponseStateType } from '../types/ResponseStateType'

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

  protected async invokeRequest (wrappedRequest: WrappedRequest<TRequestDataType>, retryOptions?: RetryOptions, wrappedResponse?: WrappedResponse<TResponseDataType>): Promise<WrappedResponse<TResponseDataType>> {
    let response: AxiosResponse

    wrappedResponse = (wrappedResponse != null) ? wrappedResponse : { state: ResponseStateType.UNKNOWN }

    // Use the passed in options, otherwise go to the defaults.
    retryOptions = (retryOptions != null) ? retryOptions : { ...this.retryOptions }

    if (retryOptions.retryCount < 1) {
      // We've exceeded our retries, we will return an empty wrapped response.  The command can decide how to handle this scenario.
      console.log('max retried reached')
      wrappedResponse.state = ResponseStateType.MAX_RETRIES
      return wrappedResponse
    }
    retryOptions.retryCount--

    try {
      const config: AxiosRequestConfig = await this.buildConfig(wrappedRequest)
      response = await this.axiosWrapper(wrappedRequest, config)
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return await this.handleAxiosError(error, wrappedResponse, wrappedRequest, retryOptions)
      }
      // We encountered some kind of non-axios error..
      console.log(JSON.stringify(error))
      wrappedResponse.state = ResponseStateType.FAILURE
      return wrappedResponse
    }

    if (wrappedRequest.statuses.allow.includes(response.status)) {
      wrappedResponse.data = response.data
      wrappedResponse.status = response.status
      wrappedResponse.state = ResponseStateType.SUCCESS
      console.log('Call completed successfully')
      return wrappedResponse
    }

    // Did not get a success -or failure-- status code
    console.log('Did not get a success or failure status code')
    return wrappedResponse
  }

  private async axiosWrapper (wrappedRequest: WrappedRequest<TRequestDataType>, config: AxiosRequestConfig): Promise<AxiosResponse> {
    switch (wrappedRequest.verb) {
      case RequestVerbType.GET: {
        return await axios.get(wrappedRequest.url, config)
      }
      case RequestVerbType.POST: {
        return await axios.post(wrappedRequest.url, wrappedRequest.data, config)
      }
      case RequestVerbType.POST_FORM: {
        const form: FormData = new FormData()

        for (const key of Object.keys(wrappedRequest.data as Record<string, string>)) {
          const value: string = (wrappedRequest.data as Record<string, string>)[key]
          form.append(key, value)
        }

        return await axios.post(wrappedRequest.url, form, config)
      }
      case RequestVerbType.DELETE: {
        return await axios.delete(wrappedRequest.url, config)
      }
      default: {
        throw new UnknownRequestVerb(wrappedRequest.verb)
      }
    }
  }

  private async handleAxiosError (error: AxiosError, wrappedResponse: WrappedResponse<TResponseDataType>, wrappedRequest: WrappedRequest<TRequestDataType>, retryOptions: RetryOptions): Promise<WrappedResponse<TResponseDataType>> {
    wrappedResponse.status = error.response?.status
    wrappedResponse.code = error.code

    if (error.response?.status !== undefined) {
      if (wrappedRequest.statuses.allow.includes(error.response?.status)) {
        // Review success cases (Which might be exception inducing, 4xx, etc)
        // The payload could be anything, probable error details.
        wrappedResponse.state = ResponseStateType.SUCCESS
        console.log('Successfully failed')
        return wrappedResponse
      } else if (wrappedRequest.statuses.retry.includes(error.response?.status)) {
        // Review failure cases
        console.log(`Received a retryable (${retryOptions.retryCount}) status code (${error.response?.status}), retrying ...`)
        await this.delay(retryOptions.sleepTime)
        return await this.invokeRequest(wrappedRequest, retryOptions, wrappedResponse)
      } else if (wrappedRequest.statuses.reauth.includes(error.response?.status)) {
        // we are in a reauth status
        console.log(`Received a re-authable (${retryOptions.retryCount}) status code (${error.response?.status}), retrying ...`)
        await this.delay(retryOptions.sleepTime)
        await this.auth()
        return await this.invokeRequest(wrappedRequest, retryOptions, wrappedResponse)
      } else {
        console.log(`Not retrying after receiving status code (${error.response?.status}).`)
        return wrappedResponse
      }
    } else {
      console.log(`Failed to make request (${retryOptions.retryCount}) code (${String(error.code)}) (${JSON.stringify(error)}), trying ...`)
      await this.delay(retryOptions.sleepTime)
      return await this.invokeRequest(wrappedRequest, retryOptions, wrappedResponse)
    }
  }

  private async delay (seconds: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
}
