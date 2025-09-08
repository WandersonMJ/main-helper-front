import { User } from './index'

export interface SSEEvent<T = any> {
  id?: string
  event: string
  data: T
  timestamp: number
}

export interface UserSSEEvent extends SSEEvent {
  event: 'user.created' | 'user.updated' | 'user.deleted' | 'users.stats_updated'
  data: UserEventData
}

export type UserEventData = 
  | UserCreatedData
  | UserUpdatedData
  | UserDeletedData
  | StatsUpdatedData

export interface UserCreatedData {
  type: 'user.created'
  user: User
  message: string
}

export interface UserUpdatedData {
  type: 'user.updated'
  user: User
  previousUser: Partial<User>
  message: string
}

export interface UserDeletedData {
  type: 'user.deleted'
  userId: string
  userName: string
  message: string
}

export interface StatsUpdatedData {
  type: 'users.stats_updated'
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  message: string
}

export interface SSEConnectionConfig {
  endpoint: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  withCredentials?: boolean
  headers?: Record<string, string>
}

export interface SSEConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'
  lastConnected?: Date
  reconnectAttempts: number
  error?: string
}