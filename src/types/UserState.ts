import { StoreType } from './StoreType'
import { FeatureType } from './FeatureType'
import { UserStore } from './UserStore'
import { UserNotification } from './UserNotification'
import { UserFeatureState } from './UserFeatureState'

export interface UserState {
  active: boolean
  stores: Record<StoreType, UserStore>
  incomes: Record<StoreType, UserStore>
  features: Set<FeatureType>
  activeFeatureState: UserFeatureState
  population: number
  merchants: Set<StoreType>
  notifications: UserNotification[]
}
