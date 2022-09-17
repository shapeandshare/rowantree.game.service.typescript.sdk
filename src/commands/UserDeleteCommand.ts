import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { WrappedResponse } from '../types/WrappedResponse'
import { CommandFailedError } from '../errors/CommandFailedError'
import { RequestVerbType } from '../types/RequestVerbType'
import { getClaims, getHeaders } from '../common/AuthContext'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserDeleteCommand extends AbstractCommand<void, void> {
  public async execute (userGuid?: string): Promise<void> {
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
      url: `${this.options.endpoint}/v1/user/${userGuid}`,
      verb: RequestVerbType.DELETE
    }
    const wrappedResponse: WrappedResponse<void> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state !== ResponseStateType.SUCCESS) {
      throw new CommandFailedError(`Delete user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
    }
  }
}
