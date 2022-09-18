import { StoreType } from './StoreType'
import { FeatureType } from './FeatureType'
import { UserStore } from './UserStore'
import { UserNotification } from './UserNotification'
import { UserFeatureState } from './UserFeatureState'
import { IncomeSourceType } from './IncomeSourceType'
import { UserIncome } from './UserIncome'

export interface UserState {
  active: boolean
  stores: Record<StoreType, UserStore>
  incomes: Record<IncomeSourceType, UserIncome>
  features: Set<FeatureType>
  activeFeatureState: UserFeatureState
  population: number
  merchants: Set<StoreType>
  notifications: UserNotification[]
}
