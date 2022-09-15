import { describe } from 'mocha'

import { config } from 'dotenv'
import { RowanTreeServiceClient } from '../../src/RowanTreeServiceClient'
import { RetryOptions, RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserWorld } from '../../src/types/UserWorld'
import { StoreType } from '../../src/types/StoreType'
import { FeatureType } from '../../src/types/FeatureType'
import { FeatureDetailsType } from '../../src/types/FeatureDetailsType'
import { UserState } from '../../src/types/UserState'

config({ path: 'env/.env.offline' })

describe('Service Client Tests', function (): void {
  const retryOptions: RetryOptions = { sleepTime: 2, retryCount: 5 }
  const authClient: RowanTreeAuthServiceClient = new RowanTreeAuthServiceClient(retryOptions)
  const client: RowanTreeServiceClient = new RowanTreeServiceClient(authClient, retryOptions)

  before(async function (): Promise<void> {})
  after(async function (): Promise<void> {})

  describe.skip('Create User Command Tests', function () {
    describe('userCreate', function () {
      it('should create a user', async function (): Promise<void> {
        const user: UserWorld = await client.userCreate()
        console.log(user)
      })
    })
  })

  describe.skip('Set User Active Command Tests', function () {
    describe('userActiveSet', function () {
      it('should set a user inactive', async function (): Promise<void> {
        await client.userActiveSet(false)
      })
      it('should set a user active', async function (): Promise<void> {
        await client.userActiveSet(true)
      })
    })
  })

  describe.skip('Set User Income Command Tests', function () {
    describe('userIncomeSet', function () {
      it('should set user income a user', async function (): Promise<void> {
        await client.userIncomeSet(StoreType.FUR, 1)
      })
    })
  })

  describe.skip('User Transport Command Tests', function () {
    describe('userTransport', function () {
      it('should transport user', async function (): Promise<void> {
        const response: FeatureDetailsType = await client.userTransport(FeatureType.ROOM)
        console.log(response)
      })
    })
  })

  describe('User State Get Command Tests', function () {
    describe('userStateGet', function () {
      it('should get user state', async function (): Promise<void> {
        const response: UserState = await client.userStateGet()
        console.log(JSON.stringify(response))
      })
    })
  })

  describe('Merchant Transform Command Tests', function () {
    describe('merchantTransform', function () {
      it('should perform merchant transform', async function (): Promise<void> {
        await client.merchantTransform(StoreType.FUR)
      })
    })
  })

  describe.skip('Delete User Command Tests', function () {
    describe('userDelete', function () {
      it('should delete a user', async function (): Promise<void> {
        await client.userDelete()
      })
    })
  })

  // describe('Register User Command Tests', function () {
  //   describe('userRegister', function () {
  //     it('should register a user', async function (): Promise<void> {
  //       const username: string = 'mockuserfour'
  //       const password: string = 'mockpassword'
  //       const email: string = 'mock@mock.local'
  //       const user: User = await client.registerUser(username, password, email)
  //       console.log(user)
  //     })
  //   })
  // })
})
