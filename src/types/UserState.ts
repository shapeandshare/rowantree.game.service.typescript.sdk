import { FeatureDetailsType } from './FeatureDetailsType'
import { StoreType } from './StoreType'
import { FeatureType } from './FeatureType'

export interface UserState {
  active: boolean
  stores: Record<StoreType, any>
  incomes: Record<StoreType, any>
  features: Set<FeatureType>
  activeFeatureState: FeatureDetailsType
  population: number
  merchants: Set<StoreType>
  notifications: any[]
}
