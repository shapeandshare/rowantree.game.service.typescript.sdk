import { IncomeSourceType } from './IncomeSourceType'

export interface UserIncomeSetRequest {
  incomeSourceName: IncomeSourceType
  amount: number
  userGuid?: string
}
