
export interface UserState {
  active: boolean
  stores: Record<any, any>
  incomes: Record<any, any>
  features: Set<any>
  activeFeature: any
  activeFeatureState: any
  population: number
  merchants: Set<any>
  notifications: any[]
}
