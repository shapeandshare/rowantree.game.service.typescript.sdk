import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { WrappedResponse } from '../types/WrappedResponse'
import { UserType } from '../types/UserType'
import { CommandFailedError } from '../errors/CommandFailedError'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { getClaims, getHeaders } from '../common/utils/AuthContext'

export class UserCreateCommand extends AbstractCommand<any, UserType> {
  public async execute (userGuid?: string): Promise<UserType> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    userGuid = userGuid ?? getClaims().sub

    const wrappedRequest: WrappedRequest<void> = {
      statuses: { allow: [201], retry: [], reauth: [401] },
      timeout: demandEnvVarAsNumber('ROWANTREE_SERVICE_TIMEOUT'),
      url: `${demandEnvVar('ROWANTREE_SERVICE_ENDPOINT')}/v1/user/${userGuid}`,
      verb: RequestVerbType.POST
    }
    const wrappedResponse: WrappedResponse<UserType> = await this.invokeRequest(wrappedRequest)
    if ((wrappedResponse?.data) !== undefined) {
      return wrappedResponse?.data
    }
    throw new CommandFailedError(`Create user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
  }
}