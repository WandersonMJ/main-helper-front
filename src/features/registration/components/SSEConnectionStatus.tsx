'use client'

import { useRegistrationStore } from '../store/registration-store'

export function SSEConnectionStatus() {
  const { 
    sseConnectionState, 
    realtimeEnabled, 
    realtimeStats,
    enableRealtime, 
    disableRealtime 
  } = useRegistrationStore()

  const getStatusColor = () => {
    switch (sseConnectionState.status) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = () => {
    switch (sseConnectionState.status) {
      case 'connected':
        return 'Conectado'
      case 'connecting':
        return 'Conectando...'
      case 'reconnecting':
        return `Reconectando... (${sseConnectionState.reconnectAttempts})`
      case 'error':
        return 'Erro de conexão'
      default:
        return 'Desconectado'
    }
  }

  const getStatusIcon = () => {
    switch (sseConnectionState.status) {
      case 'connected':
        return '🟢'
      case 'connecting':
      case 'reconnecting':
        return '🟡'
      case 'error':
        return '🔴'
      default:
        return '⚫'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Tempo Real</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {sseConnectionState.lastConnected && (
                <span className="text-xs text-gray-500">
                  Último: {sseConnectionState.lastConnected.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={realtimeEnabled}
              onChange={(e) => {
                if (e.target.checked) {
                  enableRealtime()
                } else {
                  disableRealtime()
                }
              }}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Ativar</span>
          </label>
        </div>
      </div>

      {sseConnectionState.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            <strong>Erro:</strong> {sseConnectionState.error}
          </p>
        </div>
      )}

      {realtimeEnabled && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-lg font-bold text-blue-600">
              {realtimeStats.totalUsers}
            </div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md">
            <div className="text-lg font-bold text-green-600">
              {realtimeStats.activeUsers}
            </div>
            <div className="text-xs text-green-600">Ativos</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-lg font-bold text-purple-600">
              {realtimeStats.newUsersThisMonth}
            </div>
            <div className="text-xs text-purple-600">Novos</div>
          </div>
        </div>
      )}

      {realtimeStats.lastUpdated && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Última atualização: {realtimeStats.lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}