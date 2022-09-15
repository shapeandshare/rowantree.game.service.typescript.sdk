import { StoreType } from './StoreType'

export interface UserIncomeSetRequest {
  incomeSourceName: StoreType
  amount: number
  userGuid?: string
}
