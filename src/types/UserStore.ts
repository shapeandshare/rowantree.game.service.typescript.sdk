import { StoreType } from './StoreType'

export interface UserStore {
  name: StoreType
  description?: string
  amount: number
}
