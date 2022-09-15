import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { WrappedResponse } from '../types/WrappedResponse'
import { UserType } from '../types/UserType'
import { CommandFailedError } from '../errors/CommandFailedError'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/EnvironmentUtils'
import { getClaims, getHeaders } from '../common/AuthContext'
import { ResponseStateType } from '../types/ResponseStateType'

export class UserCreateCommand extends AbstractCommand<void, UserType> {
  public async execute (userGuid?: string): Promise<UserType> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    userGuid = userGuid ?? getClaims().sub
    if (userGuid === undefined) {
      throw new CommandFailedError('No target was provided or could be resolved from request')
    }

    const wrappedRequest: WrappedRequest<void> = {
      statuses: { allow: [201], retry: [], reauth: [401] },
      timeout: demandEnvVarAsNumber('ROWANTREE_SERVICE_TIMEOUT'),
      url: `${demandEnvVar('ROWANTREE_SERVICE_ENDPOINT')}/v1/user/${userGuid}`,
      verb: RequestVerbType.POST
    }
    const wrappedResponse: WrappedResponse<UserType> = await this.invokeRequest(wrappedRequest)
    if (wrappedResponse.state === ResponseStateType.SUCCESS && (wrappedResponse?.data) !== undefined) {
      return wrappedResponse?.data
    }
    throw new CommandFailedError(`Create user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}
