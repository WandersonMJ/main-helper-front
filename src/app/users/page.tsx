'use client'

import { useState } from 'react'
import { UsersList } from '@/features/registration/components/UsersList'
import { RegistrationForm } from '@/features/registration/components/RegistrationForm'
import { User } from '@/features/registration/types'

type ViewMode = 'list' | 'create' | 'edit'

export default function UsersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleCreateUser = () => {
    setSelectedUser(null)
    setViewMode('create')
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setViewMode('edit')
  }

  const handleSuccess = (user: User) => {
    console.log('User saved successfully:', user)
    setViewMode('list')
    setSelectedUser(null)
  }

  const handleCancel = () => {
    setViewMode('list')
    setSelectedUser(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {viewMode === 'list' && 'Gerenciar Usuários'}
              {viewMode === 'create' && 'Cadastrar Novo Usuário'}
              {viewMode === 'edit' && 'Editar Usuário'}
            </h2>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {viewMode === 'list' ? (
              <button
                type="button"
                onClick={handleCreateUser}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Novo Usuário
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                ← Voltar à Lista
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {viewMode === 'list' && (
              <UsersList
                onEditUser={handleEditUser}
                onViewUser={(user) => console.log('View user:', user)}
              />
            )}
            
            {(viewMode === 'create' || viewMode === 'edit') && (
              <RegistrationForm
                user={selectedUser || undefined}
                mode={viewMode}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}