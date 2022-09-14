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

  describe('Create User Command Tests', function () {
    describe('userCreate', function () {
      it('should create a user', async function (): Promise<void> {
        const user: UserType = await client.createUser()
        console.log(user)
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
