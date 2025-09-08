'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { container } from '../container'
import { UserSSEService } from '../services/user-sse-service'
import { UserSSEEvent, UserEventData } from '../types/sse'
import { SSEConnectionState } from '@/shared/services/sse-service'

interface UseUserSSEOptions {
  autoConnect?: boolean
  onUserCreated?: (data: UserEventData) => void
  onUserUpdated?: (data: UserEventData) => void
  onUserDeleted?: (data: UserEventData) => void
  onStatsUpdated?: (data: UserEventData) => void
  onAnyEvent?: (event: UserSSEEvent) => void
  onConnectionChange?: (state: SSEConnectionState) => void
}

export function useUserSSE(options: UseUserSSEOptions = {}) {
  const {
    autoConnect = true,
    onUserCreated,
    onUserUpdated,
    onUserDeleted,
    onStatsUpdated,
    onAnyEvent,
    onConnectionChange,
  } = options

  const [connectionState, setConnectionState] = useState<SSEConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0,
  })

  const [lastEvent, setLastEvent] = useState<UserSSEEvent | null>(null)
  const [eventHistory, setEventHistory] = useState<UserSSEEvent[]>([])
  const sseServiceRef = useRef<UserSSEService | null>(null)
  const unsubscribersRef = useRef<(() => void)[]>([])

  // Initialize SSE service
  useEffect(() => {
    if (!sseServiceRef.current) {
      sseServiceRef.current = container.resolve<UserSSEService>('UserSSEService')
    }
  }, [])

  const connect = useCallback(() => {
    if (!sseServiceRef.current) return
    sseServiceRef.current.connect()
  }, [])

  const disconnect = useCallback(() => {
    if (!sseServiceRef.current) return
    sseServiceRef.current.disconnect()
  }, [])

  const clearEventHistory = useCallback(() => {
    setEventHistory([])
    setLastEvent(null)
  }, [])

  // Setup event listeners
  useEffect(() => {
    if (!sseServiceRef.current) return

    const sseService = sseServiceRef.current
    const unsubscribers: (() => void)[] = []

    // Connection state listener
    const unsubscribeStatus = sseService.onStatusChange((state) => {
      setConnectionState(state)
      onConnectionChange?.(state)
    })
    unsubscribers.push(unsubscribeStatus)

    // User created events
    if (onUserCreated) {
      const unsubscribe = sseService.onUserCreated(onUserCreated)
      unsubscribers.push(unsubscribe)
    }

    // User updated events
    if (onUserUpdated) {
      const unsubscribe = sseService.onUserUpdated(onUserUpdated)
      unsubscribers.push(unsubscribe)
    }

    // User deleted events
    if (onUserDeleted) {
      const unsubscribe = sseService.onUserDeleted(onUserDeleted)
      unsubscribers.push(unsubscribe)
    }

    // Stats updated events
    if (onStatsUpdated) {
      const unsubscribe = sseService.onStatsUpdated(onStatsUpdated)
      unsubscribers.push(unsubscribe)
    }

    // Any event listener (for event history)
    const unsubscribeAny = sseService.onAnyUserEvent((event) => {
      setLastEvent(event)
      setEventHistory((prev) => [event, ...prev.slice(0, 99)]) // Keep last 100 events
      onAnyEvent?.(event)
    })
    unsubscribers.push(unsubscribeAny)

    unsubscribersRef.current = unsubscribers

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [
    onUserCreated,
    onUserUpdated,
    onUserDeleted,
    onStatsUpdated,
    onAnyEvent,
    onConnectionChange,
  ])

  // Auto connect
  useEffect(() => {
    if (autoConnect && sseServiceRef.current) {
      connect()
    }

    return () => {
      if (sseServiceRef.current) {
        disconnect()
      }
    }
  }, [autoConnect, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribersRef.current.forEach((unsubscribe) => unsubscribe())
      if (sseServiceRef.current) {
        sseServiceRef.current.disconnect()
      }
    }
  }, [])

  return {
    // Connection management
    connect,
    disconnect,
    connectionState,
    isConnected: connectionState.status === 'connected',
    isConnecting: connectionState.status === 'connecting',
    isReconnecting: connectionState.status === 'reconnecting',
    hasError: connectionState.status === 'error',
    
    // Event data
    lastEvent,
    eventHistory,
    clearEventHistory,
    
    // Utils
    reconnectAttempts: connectionState.reconnectAttempts,
    lastConnected: connectionState.lastConnected,
    error: connectionState.error,
  }
}

// Specialized hooks for specific event types
export function useUserCreatedEvents(callback: (data: UserEventData) => void, autoConnect = true) {
  return useUserSSE({
    autoConnect,
    onUserCreated: callback,
  })
}

export function useUserUpdatedEvents(callback: (data: UserEventData) => void, autoConnect = true) {
  return useUserSSE({
    autoConnect,
    onUserUpdated: callback,
  })
}

export function useUserDeletedEvents(callback: (data: UserEventData) => void, autoConnect = true) {
  return useUserSSE({
    autoConnect,
    onUserDeleted: callback,
  })
}

export function useUserStatsEvents(callback: (data: UserEventData) => void, autoConnect = true) {
  return useUserSSE({
    autoConnect,
    onStatsUpdated: callback,
  })
}