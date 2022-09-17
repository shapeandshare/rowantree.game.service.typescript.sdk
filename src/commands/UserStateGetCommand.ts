import { AbstractCommand } from './AbstractCommand'
import { UserState } from '../types/UserState'
import { getClaims, getHeaders } from '../common/AuthContext'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserStateGetCommand extends AbstractCommand<any, any> {
  public async execute (userGuid?: string): Promise<UserState> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    userGuid = userGuid ?? getClaims().sub
    if (userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<void> = {
      statuses: { allow: [200], retry: [0], reauth: [401] },
      timeout: this.options.timeout,
      url: `${this.options.endpoint}/v1/user/${userGuid}/state`,
      verb: RequestVerbType.GET
    }
    const wrappedResponse: WrappedResponse<UserState> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state === ResponseStateType.SUCCESS && (wrappedResponse?.data) !== undefined) {
      return wrappedResponse?.data
    }
    throw new CommandFailedError(`Get user state command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
