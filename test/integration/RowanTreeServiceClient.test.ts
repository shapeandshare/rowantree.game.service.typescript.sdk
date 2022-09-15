import { describe } from 'mocha'

import { config } from 'dotenv'
import { RowanTreeServiceClient } from '../../src/RowanTreeServiceClient'
import { RetryOptions, RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserWorld } from '../../src/types/UserWorld'
import { StoreType } from '../../src/types/StoreType'
config({ path: 'env/.env.offline' })

describe('Service Client Tests', function (): void {
  const retryOptions: RetryOptions = { sleepTime: 2, retryCount: 5 }
  const authClient: RowanTreeAuthServiceClient = new RowanTreeAuthServiceClient(retryOptions)
  const client: RowanTreeServiceClient = new RowanTreeServiceClient(authClient, retryOptions)

  before(async function (): Promise<void> {})
  after(async function (): Promise<void> {})

  describe('Create User Command Tests', function () {
    describe('userCreate', function () {
      it('should create a user', async function (): Promise<void> {
        const user: UserWorld = await client.userCreate()
        console.log(user)
      })
    })
  })

  describe('Set User Active Command Tests', function () {
    describe('userActiveSet', function () {
      it('should set a user inactive', async function (): Promise<void> {
        await client.userActiveSet(false)
      })
      it('should set a user active', async function (): Promise<void> {
        await client.userActiveSet(true)
      })
    })
  })

  describe('Set User Income Command Tests', function () {
    describe('userIncomeSet', function () {
      it('should set user income a user', async function (): Promise<void> {
        await client.userIncomeSet(StoreType.FUR, 1)
      })
    })
  })

  describe('Delete User Command Tests', function () {
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
