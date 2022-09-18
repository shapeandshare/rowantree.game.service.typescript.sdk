import { CommandOptions } from './types/CommandOptions'
import { RowanTreeAuthServiceClient, Token } from 'rowantree.auth.typescript.sdk'
import { UserCreateCommand } from './commands/UserCreateCommand'
import { UserWorld } from './types/UserWorld'
import { UserDeleteCommand } from './commands/UserDeleteCommand'
import { UserActiveSetCommand } from './commands/UserActiveSetCommand'
import { UserActiveStatus } from './types/UserActiveStatus'
import { UserActiveSetRequest } from './types/UserActiveSetRequest'
import { StoreType } from './types/StoreType'
import { UserIncomeSetRequest } from './types/UserIncomeSetRequest'
import { UserIncomeSetCommand } from './commands/UserIncomeSetCommand'
import { FeatureType } from './types/FeatureType'
import { UserTransportRequest } from './types/UserTransportRequest'
import { UserTransportCommand } from './commands/UserTransportCommand'
import { FeatureDetailsType } from './types/FeatureDetailsType'
import { UserState } from './types/UserState'
import { UserStateGetCommand } from './commands/UserStateGetCommand'
import { MerchantTransformCommand } from './commands/MerchantTransformCommand'
import { MerchantTransformRequest } from './types/MerchantTransformRequest'
import { IncomeSourceType } from './types/IncomeSourceType'

export class RowanTreeServiceClient {
  readonly #userCreateCommand: UserCreateCommand
  readonly #userDeleteCommand: UserDeleteCommand
  readonly #userActiveSetCommand: UserActiveSetCommand
  readonly #userIncomeSetCommand: UserIncomeSetCommand
  readonly #userTransportCommand: UserTransportCommand
  readonly #userStateGetCommand: UserStateGetCommand
  readonly #merchantTransformCommand: MerchantTransformCommand

  public constructor (authClient: RowanTreeAuthServiceClient, options?: CommandOptions, browser: boolean = false) {
    this.#userCreateCommand = new UserCreateCommand(authClient, options, browser)
    this.#userDeleteCommand = new UserDeleteCommand(authClient, options, browser)
    this.#userActiveSetCommand = new UserActiveSetCommand(authClient, options, browser)
    this.#userIncomeSetCommand = new UserIncomeSetCommand(authClient, options, browser)
    this.#userTransportCommand = new UserTransportCommand(authClient, options, browser)
    this.#userStateGetCommand = new UserStateGetCommand(authClient, options, browser)
    this.#merchantTransformCommand = new MerchantTransformCommand(authClient, options, browser)
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

  public async userIncomeSet (incomeSourceName: IncomeSourceType, amount: number, userGuid?: string): Promise<void> {
    const request: UserIncomeSetRequest = { incomeSourceName, amount, userGuid }
    await this.#userIncomeSetCommand.execute(request)
  }

  public async userTransport (location: FeatureType, userGuid?: string): Promise<FeatureDetailsType> {
    const request: UserTransportRequest = { location, userGuid }
    return await this.#userTransportCommand.execute(request)
  }

  public async userStateGet (userGuid?: string): Promise<UserState> {
    return await this.#userStateGetCommand.execute(userGuid)
  }

  public async merchantTransform (storeName: StoreType, userGuid?: string): Promise<void> {
    const request: MerchantTransformRequest = { storeName, userGuid }
    await this.#merchantTransformCommand.execute(request)
  }

  public setCredentials (token: Token): void {
    // All commands share the credentials so it only needs to be set on one (any of them)
    this.#userCreateCommand.setCredentials(token)
  }
}
