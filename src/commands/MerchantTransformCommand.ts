import { AbstractCommand } from './AbstractCommand'
import { getClaims, getHeaders } from '../common/AuthContext'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedRequest } from '../types/WrappedRequest'
import { RequestVerbType } from '../types/RequestVerbType'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'
import { MerchantTransformRequest } from '../types/MerchantTransformRequest'

export class MerchantTransformCommand extends AbstractCommand<MerchantTransformRequest, void> {
  public async execute (request: MerchantTransformRequest): Promise<void> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    request.userGuid = request.userGuid ?? getClaims().sub

    if (request.userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<Omit<MerchantTransformRequest, 'userGuid'>> = {
      statuses: { allow: [200], retry: [0, 503], reauth: [401] },
      timeout: this.options.timeout,
      url: `https://api.${this.options.tld}/game/v1/user/${request.userGuid}/merchant`,
      verb: RequestVerbType.POST,
      data: { storeName: request.storeName }
    }
    const wrappedResponse: WrappedResponse<void> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state !== ResponseStateType.SUCCESS) {
      throw new CommandFailedError(`Merchant transform command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
    }
  }
}
