import { UserEvent } from './UserEvent'

export interface UserNotification {
  index: number
  timestamp: string
  event: UserEvent
}
