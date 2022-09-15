import { FeatureDetailsType } from './FeatureDetailsType'
import { StoreType } from './StoreType'
import { FeatureType } from './FeatureType'
import { UserStore } from './UserStore'
import { UserNotification } from './UserNotification'

export interface UserState {
  active: boolean
  stores: Record<StoreType, UserStore>
  incomes: Record<StoreType, UserStore>
  features: Set<FeatureType>
  activeFeatureState: FeatureDetailsType
  population: number
  merchants: Set<StoreType>
  notifications: UserNotification[]
}
