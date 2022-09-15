import { RetryOptions } from './types/RetryOptions'
import { RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserCreateCommand } from './commands/UserCreateCommand'
import { UserWorld } from './types/UserWorld'
import { UserDeleteCommand } from './commands/UserDeleteCommand'
import { UserActiveSetCommand } from './commands/UserActiveSetCommand'
import { UserActiveStatus } from './types/UserActiveStatus'
import { UserActiveSetRequest } from './types/UserActiveSetRequest'
import { StoreType } from './types/StoreType'
import { UserIncomeSetRequest } from './types/UserIncomeSetRequest'
import { UserIncomeSetCommand } from './commands/UserIncomeSetCommand'

export class RowanTreeServiceClient {
  readonly #userCreateCommand: UserCreateCommand
  readonly #userDeleteCommand: UserDeleteCommand
  readonly #userActiveSetCommand: UserActiveSetCommand
  readonly #userIncomeSetCommand: UserIncomeSetCommand

  public constructor (authClient?: RowanTreeAuthServiceClient, retryOptions?: RetryOptions) {
    authClient = (authClient != null) ? authClient : new RowanTreeAuthServiceClient(retryOptions)

    this.#userCreateCommand = new UserCreateCommand(authClient, retryOptions)
    this.#userDeleteCommand = new UserDeleteCommand(authClient, retryOptions)
    this.#userActiveSetCommand = new UserActiveSetCommand(authClient, retryOptions)
    this.#userIncomeSetCommand = new UserIncomeSetCommand(authClient, retryOptions)
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

  public async userIncomeSet (incomeSourceName: StoreType, amount: number, userGuid?: string): Promise<void> {
    const request: UserIncomeSetRequest = { incomeSourceName, amount, userGuid }
    await this.#userIncomeSetCommand.execute(request)
  }
}
