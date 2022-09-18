import { IncomeSourceType } from './IncomeSourceType'

export interface UserIncome {
  amount: number
  name: IncomeSourceType
  description?: string
}
