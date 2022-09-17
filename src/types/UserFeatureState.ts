import { FeatureType } from './FeatureType'
import { FeatureDetailsType } from './FeatureDetailsType'

export interface UserFeatureState {
  name?: FeatureType
  details?: FeatureDetailsType
  description?: string
}
