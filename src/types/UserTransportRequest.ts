import { FeatureType } from './FeatureType'

export interface UserTransportRequest {
  userGuid?: string
  location: FeatureType
}
