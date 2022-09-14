import { UserStateType } from './UserStateType'

export interface UserType {
  guid: string
  state?: UserStateType
}
