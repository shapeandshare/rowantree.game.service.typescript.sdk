import { RetryOptions } from './types/RetryOptions'
import { RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserCreateCommand } from './commands/UserCreateCommand'
import { UserWorld } from './types/UserWorld'
import { UserDeleteCommand } from './commands/UserDeleteCommand'
import { UserActiveSetCommand } from './commands/UserActiveSetCommand'
import { UserActiveStatus } from './types/UserActiveStatus'
import { UserActiveSetRequest } from './types/UserActiveSetRequest'

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

  public async userCreate (userGuid?: string): Promise<UserWorld> {
    return await this.#userCreateCommand.execute(userGuid)
  }

  public async userDelete (userGuid?: string): Promise<void> {
    await this.#userDeleteCommand.execute(userGuid)
  }

  public async userActiveSet (active: boolean, userGuid?: string): Promise<UserActiveStatus> {
    const request: UserActiveSetRequest = { active, userGuid }
    return await this.#userActiveSetCommand.execute(request)
  }
}
