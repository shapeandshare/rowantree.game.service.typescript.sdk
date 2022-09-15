import { describe } from 'mocha'

import { config } from 'dotenv'
import { RowanTreeServiceClient } from '../../src/RowanTreeServiceClient'
import { RetryOptions, RowanTreeAuthServiceClient } from 'rowantree.auth.typescript.sdk'
import { UserType } from '../../src/types/UserType'
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
        const user: UserType = await client.userCreate()
        console.log(user)
      })
    })
  })

  describe('Set User Active Command Tests', function () {
    async function delay (seconds: number): Promise<void> {
      return await new Promise(resolve => setTimeout(resolve, seconds * 1000))
    }

    describe('userActiveSet', function () {
      it('should set a user active', async function (): Promise<void> {
        await client.userActiveSet(true)
      })
      it('should set a user inactive', async function (): Promise<void> {
        await client.userActiveSet(false)
      })
      it('should set a user inactive', async function (): Promise<void> {
        await client.userActiveSet(true, 'asd')
        await delay(1)
        await client.userActiveSet(true)
        await delay(1)
        await client.userActiveSet(true)
        await delay(1)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
        // await client.userActiveSet(true)
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
