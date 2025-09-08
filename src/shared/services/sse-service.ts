export interface SSEServiceConfig {
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

export interface SSEEvent<T = any> {
  id?: string
  event: string
  data: T
  timestamp: number
}

export class SSEService<TEvent extends SSEEvent = SSEEvent> {
  private eventSource: EventSource | null = null
  private listeners = new Map<string, Set<(event: TEvent) => void>>()
  private statusListeners = new Set<(state: SSEConnectionState) => void>()
  private reconnectTimeout: NodeJS.Timeout | null = null
  private state: SSEConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0,
  }

  constructor(private config: SSEServiceConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      withCredentials: true,
      ...config,
    }
  }

  connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN) {
      return
    }

    this.updateState({ status: 'connecting' })

    try {
      // Build URL with auth token if available
      const url = new URL(this.config.endpoint, window.location.origin)
      const token = localStorage.getItem('auth-token')
      if (token) {
        url.searchParams.append('token', token)
      }

      this.eventSource = new EventSource(url.toString(), {
        withCredentials: this.config.withCredentials,
      })

      this.setupEventListeners()
    } catch (error) {
      this.handleError(error instanceof Error ? error.message : 'Failed to create connection')
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return

    this.eventSource.onopen = () => {
      this.updateState({
        status: 'connected',
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: undefined,
      })
      this.clearReconnectTimeout()
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.handleError('Connection closed by server')
      } else {
        this.handleError('Connection error occurred')
      }
    }

    // Listen for all message types
    this.eventSource.onmessage = (event) => {
      this.handleMessage(event)
    }

    // Setup specific event listeners for known event types
    const eventTypes = Array.from(this.listeners.keys())
    eventTypes.forEach(eventType => {
      this.eventSource?.addEventListener(eventType, (event) => {
        this.handleMessage(event as MessageEvent, eventType)
      })
    })
  }

  private handleMessage(event: MessageEvent, eventType?: string): void {
    try {
      const data = JSON.parse(event.data)
      const sseEvent: TEvent = {
        id: event.lastEventId || undefined,
        event: eventType || data.event || 'message',
        data: data,
        timestamp: Date.now(),
      } as TEvent

      // Notify specific event listeners
      const specificListeners = this.listeners.get(sseEvent.event)
      if (specificListeners) {
        specificListeners.forEach(listener => {
          try {
            listener(sseEvent)
          } catch (error) {
            console.error('Error in SSE event listener:', error)
          }
        })
      }

      // Notify generic message listeners
      const messageListeners = this.listeners.get('*')
      if (messageListeners) {
        messageListeners.forEach(listener => {
          try {
            listener(sseEvent)
          } catch (error) {
            console.error('Error in SSE message listener:', error)
          }
        })
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error)
    }
  }

  private handleError(errorMessage: string): void {
    this.updateState({
      status: 'error',
      error: errorMessage,
    })

    if (this.shouldReconnect()) {
      this.scheduleReconnect()
    }
  }

  private shouldReconnect(): boolean {
    return (
      this.config.maxReconnectAttempts === undefined ||
      this.state.reconnectAttempts < this.config.maxReconnectAttempts
    )
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimeout()
    
    this.updateState({ status: 'reconnecting' })
    
    this.reconnectTimeout = setTimeout(() => {
      this.updateState({
        reconnectAttempts: this.state.reconnectAttempts + 1,
      })
      
      this.disconnect()
      this.connect()
    }, this.config.reconnectInterval)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  private updateState(updates: Partial<SSEConnectionState>): void {
    this.state = { ...this.state, ...updates }
    this.statusListeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('Error in SSE status listener:', error)
      }
    })
  }

  addEventListener(eventType: string, listener: (event: TEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(listener)

    // If we're already connected, add the event listener to the EventSource
    if (this.eventSource && eventType !== '*') {
      this.eventSource.addEventListener(eventType, (event) => {
        this.handleMessage(event as MessageEvent, eventType)
      })
    }
  }

  removeEventListener(eventType: string, listener: (event: TEvent) => void): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  onStatusChange(listener: (state: SSEConnectionState) => void): () => void {
    this.statusListeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  disconnect(): void {
    this.clearReconnectTimeout()
    
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.updateState({
      status: 'disconnected',
      error: undefined,
    })
  }

  getState(): SSEConnectionState {
    return { ...this.state }
  }

  isConnected(): boolean {
    return this.state.status === 'connected'
  }
}