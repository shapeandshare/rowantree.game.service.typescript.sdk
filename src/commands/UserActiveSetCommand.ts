import { AbstractCommand } from './AbstractCommand'
import { getClaims, getHeaders } from '../common/utils/AuthContext'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedRequest } from '../types/WrappedRequest'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { RequestVerbType } from '../types/RequestVerbType'
import { UserActiveGetStatusType } from '../types/UserActiveGetStatusType'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserActiveSetCommand extends AbstractCommand<UserActiveGetStatusType, UserActiveGetStatusType> {
  public async execute (active: boolean, userGuid?: string): Promise<UserActiveGetStatusType> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    userGuid = userGuid ?? getClaims().sub
    if (userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const request: UserActiveGetStatusType = { active }
    const wrappedRequest: WrappedRequest<UserActiveGetStatusType> = {
      statuses: { allow: [200], retry: [], reauth: [401] },
      timeout: demandEnvVarAsNumber('ROWANTREE_SERVICE_TIMEOUT'),
      url: `${demandEnvVar('ROWANTREE_SERVICE_ENDPOINT')}/v1/user/${userGuid}/active`,
      verb: RequestVerbType.POST,
      data: request
    }
    const wrappedResponse: WrappedResponse<UserActiveGetStatusType> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state === ResponseStateType.SUCCESS && ((wrappedResponse?.data) !== undefined)) {
      return wrappedResponse?.data
    }
    throw new CommandFailedError(`User active state set command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
