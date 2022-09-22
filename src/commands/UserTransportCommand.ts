import { AbstractCommand } from './AbstractCommand'
import { UserTransportRequest } from '../types/UserTransportRequest'
import { getClaims, getHeaders } from '../common/AuthContext'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'
import { FeatureDetailsType } from '../types/FeatureDetailsType'

export class UserTransportCommand extends AbstractCommand<UserTransportRequest, FeatureDetailsType> {
  public async execute (request: UserTransportRequest): Promise<FeatureDetailsType> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    request.userGuid = request.userGuid ?? getClaims().sub

    if (request.userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<Omit<UserTransportRequest, 'userGuid'>> = {
      statuses: { allow: [200], retry: [0], reauth: [401] },
      timeout: this.options.timeout,
      url: `https://api.${this.options.tld}/game/v1/user/${request.userGuid}/transport`,
      verb: RequestVerbType.POST,
      data: { location: request.location }
    }
    const wrappedResponse: WrappedResponse<FeatureDetailsType> = await this.invokeRequest(wrappedRequest)
    if ((wrappedResponse.state !== ResponseStateType.SUCCESS) || (wrappedResponse?.data === undefined)) {
      throw new CommandFailedError(`Set user income command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
    }
    return wrappedResponse.data
  }
}
