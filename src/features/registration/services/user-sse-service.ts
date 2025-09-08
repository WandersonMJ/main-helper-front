import { SSEService } from '@/shared/services/sse-service'
import { UserSSEEvent, UserEventData } from '../types/sse'

export class UserSSEService extends SSEService<UserSSEEvent> {
  constructor() {
    super({
      endpoint: '/api/users/events',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      withCredentials: true,
    })
  }

  onUserCreated(callback: (data: UserEventData) => void): () => void {
    const listener = (event: UserSSEEvent) => {
      if (event.event === 'user.created') {
        callback(event.data)
      }
    }
    
    this.addEventListener('user.created', listener)
    
    return () => {
      this.removeEventListener('user.created', listener)
    }
  }

  onUserUpdated(callback: (data: UserEventData) => void): () => void {
    const listener = (event: UserSSEEvent) => {
      if (event.event === 'user.updated') {
        callback(event.data)
      }
    }
    
    this.addEventListener('user.updated', listener)
    
    return () => {
      this.removeEventListener('user.updated', listener)
    }
  }

  onUserDeleted(callback: (data: UserEventData) => void): () => void {
    const listener = (event: UserSSEEvent) => {
      if (event.event === 'user.deleted') {
        callback(event.data)
      }
    }
    
    this.addEventListener('user.deleted', listener)
    
    return () => {
      this.removeEventListener('user.deleted', listener)
    }
  }

  onStatsUpdated(callback: (data: UserEventData) => void): () => void {
    const listener = (event: UserSSEEvent) => {
      if (event.event === 'users.stats_updated') {
        callback(event.data)
      }
    }
    
    this.addEventListener('users.stats_updated', listener)
    
    return () => {
      this.removeEventListener('users.stats_updated', listener)
    }
  }

  onAnyUserEvent(callback: (event: UserSSEEvent) => void): () => void {
    this.addEventListener('*', callback)
    
    return () => {
      this.removeEventListener('*', callback)
    }
  }
}