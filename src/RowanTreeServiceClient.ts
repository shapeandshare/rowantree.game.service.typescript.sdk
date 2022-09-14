import { RetryOptions } from './types/RetryOptions'
import { RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserCreateCommand } from './commands/UserCreateCommand'
import { UserType } from './types/UserType'
import { UserDeleteCommand } from './commands/UserDeleteCommand'
import { UserActiveSetCommand } from './commands/UserActiveSetCommand'

export class RowanTreeServiceClient {
  readonly #userCreateCommand: UserCreateCommand
  readonly #userDeleteCommand: UserDeleteCommand
  readonly #userActiveSetCommand: UserActiveSetCommand

  public constructor (authClient?: RowanTreeAuthServiceClient, retryOptions?: RetryOptions) {
    authClient = (authClient != null) ? authClient : new RowanTreeAuthServiceClient(retryOptions)

    this.#userCreateCommand = new UserCreateCommand(authClient, retryOptions)
    this.#userDeleteCommand = new UserDeleteCommand(authClient, retryOptions)
    this.#userActiveSetCommand = new UserActiveSetCommand(authClient, retryOptions)
  }

  public async userCreate (userGuid?: string): Promise<UserType> {
    return await this.#userCreateCommand.execute(userGuid)
  }

  public async userDelete (userGuid?: string): Promise<void> {
    await this.#userDeleteCommand.execute(userGuid)
  }

  public async userActiveSet (active: boolean, userGuid?: string): Promise<void> {
    await this.#userActiveSetCommand.execute(active, userGuid)
  }
}
