'use client'

import { useEffect } from 'react'
import { useDeleteUserMutation } from '../hooks/use-users-query'
import { useRegistrationStore } from '../store/registration-store'
import { useRegistrationRealtime } from '../hooks/use-registration-realtime'
import { User } from '../types'

interface UsersListProps {
  onEditUser?: (user: User) => void
  onViewUser?: (user: User) => void
}

export function UsersList({ onEditUser, onViewUser }: UsersListProps) {
  const { 
    users, 
    filters, 
    paginationData, 
    isLoading, 
    error, 
    fetchUsers, 
    setFilters,
    clearError,
    realtimeEnabled,
    sseConnectionState,
  } = useRegistrationStore()

  const deleteUserMutation = useDeleteUserMutation()
  
  // Initialize realtime connection
  useRegistrationRealtime()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, name: searchTerm, page: 1 }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page }
    setFilters(newFilters)
    fetchUsers(newFilters)
  }

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id)
        fetchUsers() // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex justify-between items-center">
          <div className="text-red-700">
            <strong>Erro:</strong> {error}
          </div>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={filters.name || ''}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          {realtimeEnabled && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                sseConnectionState.status === 'connected' ? 'bg-green-500' : 
                sseConnectionState.status === 'connecting' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-500">
                {sseConnectionState.status === 'connected' ? 'Tempo real ativo' : 'Reconectando...'}
              </span>
            </div>
          )}
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {paginationData.total} usuários
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Users table */}
      {!isLoading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500">
                Nenhum usuário encontrado
              </li>
            ) : (
              users.map((user) => (
                <li key={user.id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{user.email}</span>
                          {user.phone && <span>{user.phone}</span>}
                          {user.address && (
                            <span>{user.address.city}, {user.address.state}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onViewUser && (
                        <button
                          onClick={() => onViewUser(user)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          Ver
                        </button>
                      )}
                      
                      {onEditUser && (
                        <button
                          onClick={() => onEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Editar
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                        disabled={deleteUserMutation.isPending}
                      >
                        {deleteUserMutation.isPending ? 'Deletando...' : 'Deletar'}
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {paginationData.page} de {paginationData.totalPages}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(paginationData.page - 1)}
              disabled={paginationData.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            <button
              onClick={() => handlePageChange(paginationData.page + 1)}
              disabled={paginationData.page === paginationData.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}