'use client'

import { useEffect } from 'react'
import { useRegistrationStore } from '../store/registration-store'
import { useUserSSE } from './use-user-sse'

export function useRegistrationRealtime() {
  const { 
    realtimeEnabled,
    handleUserCreated,
    handleUserUpdated,
    handleUserDeleted,
    handleStatsUpdated,
    setSSEConnectionState,
  } = useRegistrationStore()

  const { 
    connect, 
    disconnect, 
    connectionState, 
    isConnected 
  } = useUserSSE({
    autoConnect: false,
    onUserCreated: (data) => {
      if (data.type === 'user.created') {
        handleUserCreated(data)
      }
    },
    onUserUpdated: (data) => {
      if (data.type === 'user.updated') {
        handleUserUpdated(data)
      }
    },
    onUserDeleted: (data) => {
      if (data.type === 'user.deleted') {
        handleUserDeleted(data)
      }
    },
    onStatsUpdated: (data) => {
      if (data.type === 'users.stats_updated') {
        handleStatsUpdated(data)
      }
    },
    onConnectionChange: (state) => {
      setSSEConnectionState(state)
    },
  })

  // Manage connection based on realtime enabled state
  useEffect(() => {
    if (realtimeEnabled) {
      connect()
    } else {
      disconnect()
    }
  }, [realtimeEnabled, connect, disconnect])

  // Sync connection state with store
  useEffect(() => {
    setSSEConnectionState(connectionState)
  }, [connectionState, setSSEConnectionState])

  return {
    isConnected,
    connectionState,
    connect,
    disconnect,
  }
}