import { AbstractCommand } from './AbstractCommand'
import { getClaims, getHeaders } from '../common/AuthContext'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { UserActiveStatus } from '../types/UserActiveStatus'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'
import { UserActiveSetRequest } from '../types/UserActiveSetRequest'

export class UserActiveSetCommand extends AbstractCommand<UserActiveStatus, UserActiveStatus> {
  public async execute (request: UserActiveSetRequest): Promise<UserActiveStatus> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    request.userGuid = request.userGuid ?? getClaims().sub
    if (request.userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<UserActiveStatus> = {
      statuses: { allow: [200], retry: [0], reauth: [401] },
      timeout: this.options.timeout,
      url: `https://api.${this.options.tld}/game/v1/user/${request.userGuid}/active`,
      verb: RequestVerbType.POST,
      data: request
    }
    const wrappedResponse: WrappedResponse<UserActiveStatus> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state === ResponseStateType.SUCCESS && ((wrappedResponse?.data) !== undefined)) {
      return wrappedResponse?.data
    }
    throw new CommandFailedError(`User active state set command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
