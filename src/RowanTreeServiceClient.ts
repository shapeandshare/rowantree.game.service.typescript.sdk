import { RetryOptions } from './types/RetryOptions'
import { RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserCreateCommand } from './commands/UserCreateCommand'
import { UserType } from './types/UserType'
import { UserDeleteCommand } from './commands/UserDeleteCommand'

export class RowanTreeServiceClient {
  readonly #userCreateCommand: UserCreateCommand
  readonly #userDeleteCommand: UserDeleteCommand

  public constructor (authClient?: RowanTreeAuthServiceClient, retryOptions?: RetryOptions) {
    authClient = (authClient != null) ? authClient : new RowanTreeAuthServiceClient(retryOptions)

    this.#userCreateCommand = new UserCreateCommand(authClient, retryOptions)
    this.#userDeleteCommand = new UserDeleteCommand(authClient, retryOptions)
  }

  public async createUser (userGuid?: string): Promise<UserType> {
    return await this.#userCreateCommand.execute(userGuid)
  }

  public async deleteUser (userGuid?: string): Promise<void> {
    await this.#userDeleteCommand.execute(userGuid)
  }
}
