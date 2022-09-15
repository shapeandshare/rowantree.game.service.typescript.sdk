
export interface UserState {
  active: boolean
  stores: Record<any, any>
  incomes: Record<any, any>
  features: Set<any>
  active_feature: any
  active_feature_state: any
  population: number
  merchants: Set<any>
  notifications: any[]
}
