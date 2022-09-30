import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { WrappedResponse } from '../types/WrappedResponse'
import { UserWorld } from '../types/UserWorld'
import { CommandFailedError } from '../errors/CommandFailedError'
import { RequestVerbType } from '../types/RequestVerbType'
import { getClaims, getHeaders } from '../common/AuthContext'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserCreateCommand extends AbstractCommand<void, UserWorld> {
  public async execute (userGuid?: string): Promise<UserWorld> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }
    console.log(userGuid)
    // Target the guid provided, otherwise default to the subject of the claims.
    userGuid = userGuid ?? getClaims().sub
    console.log(userGuid)
    if (userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<void> = {
      statuses: { allow: [201], retry: [0, 503], reauth: [401] },
      timeout: this.options.timeout,
      url: `https://api.${this.options.tld}/game/v1/user/${userGuid}`,
      verb: RequestVerbType.POST
    }
    const wrappedResponse: WrappedResponse<UserWorld> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state === ResponseStateType.SUCCESS && (wrappedResponse?.data) !== undefined) {
      return wrappedResponse?.data
    }
    throw new CommandFailedError(`Create user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
