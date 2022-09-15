import { AbstractCommand } from './AbstractCommand'
import { UserIncomeSetRequest } from '../types/UserIncomeSetRequest'
import { getClaims, getHeaders } from '../common/AuthContext'
import { CommandFailedError } from '../errors/CommandFailedError'
import { WrappedRequest } from '../types/WrappedRequest'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/EnvironmentUtils'
import { RequestVerbType } from '../types/RequestVerbType'
import { WrappedResponse } from '../types/WrappedResponse'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserIncomeSetCommand extends AbstractCommand<UserIncomeSetRequest, void> {
  public async execute (request: UserIncomeSetRequest): Promise<void> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    request.userGuid = request.userGuid ?? getClaims().sub

    if (request.userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<Omit<UserIncomeSetRequest, 'userGuid'>> = {
      statuses: { allow: [200], retry: [], reauth: [401] },
      timeout: demandEnvVarAsNumber('ROWANTREE_SERVICE_TIMEOUT'),
      url: `${demandEnvVar('ROWANTREE_SERVICE_ENDPOINT')}/v1/user/${request.userGuid}/income`,
      verb: RequestVerbType.POST,
      data: { incomeSourceName: request.incomeSourceName, amount: request.amount }
    }
    const wrappedResponse: WrappedResponse<void> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state !== ResponseStateType.SUCCESS) {
      throw new CommandFailedError(`Set user income command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
    }
  }
}
