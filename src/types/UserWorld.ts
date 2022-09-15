import { UserState } from './UserState'

export interface UserWorld {
  guid: string
  state?: UserState
}
