import { UserEventOtherType } from './UserEventOtherType'
import { StoreType } from './StoreType'

export interface UserEvent {
  title: string
  text: Record<number, string>
  notification: Record<number, string>
  reward: Record<UserEventOtherType | StoreType, number>
  curse: Record<UserEventOtherType | StoreType, number>
  requirements: Record<UserEventOtherType | StoreType, number>
}
