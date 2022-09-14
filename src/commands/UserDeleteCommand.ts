import { AbstractCommand } from './AbstractCommand'
import { WrappedRequest } from '../types/WrappedRequest'
import { WrappedResponse } from '../types/WrappedResponse'
import { CommandFailedError } from '../errors/CommandFailedError'
import { RequestVerbType } from '../types/RequestVerbType'
import { demandEnvVar, demandEnvVarAsNumber } from '../common/utils/EnvironmentUtills'
import { getClaims, getHeaders } from '../common/utils/AuthContext'

export class UserDeleteCommand extends AbstractCommand<void, void> {
  public async execute (userGuid?: string): Promise<void> {
    if (getHeaders() === undefined || !('Authorization' in getHeaders())) {
      await this.auth()
    }

    // Target the guid provided, otherwise default to the subject of the claims.
    userGuid = userGuid ?? getClaims().sub

    if (userGuid === undefined){
      throw new CommandFailedError("No target was provided or could be resolved from request")
    }

    const wrappedRequest: WrappedRequest<void> = {
      statuses: { allow: [200], retry: [], reauth: [401] },
      timeout: demandEnvVarAsNumber('ROWANTREE_SERVICE_TIMEOUT'),
      url: `${demandEnvVar('ROWANTREE_SERVICE_ENDPOINT')}/v1/user/${userGuid}`,
      verb: RequestVerbType.DELETE
    }
    const wrappedResponse: WrappedResponse<void> = await this.invokeRequest(wrappedRequest)
    if ((wrappedResponse?.status) === undefined) {
      throw new CommandFailedError(`Delete user command failed unexpectedly: ${JSON.stringify(wrappedResponse)}`)
    }
  }
}
