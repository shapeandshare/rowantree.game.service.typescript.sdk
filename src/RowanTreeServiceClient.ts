import { RetryOptions } from './types/RetryOptions'
import { RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserCreateCommand } from './commands/UserCreateCommand'
import { UserType } from './types/UserType'

export class RowanTreeServiceClient {
  readonly #userCreateCommand: UserCreateCommand

  public constructor (authClient?: RowanTreeAuthServiceClient, retryOptions?: RetryOptions) {
    authClient = (authClient != null) ? authClient : new RowanTreeAuthServiceClient(retryOptions)

    this.#userCreateCommand = new UserCreateCommand(authClient, retryOptions)
  }

  public async createUser (userGuid?: string): Promise<UserType> {
    return await this.#userCreateCommand.execute(userGuid)
  }
}
