'use client'

import { useState } from 'react'
import { useUsersQuery } from '@/features/registration/hooks/use-users-query'
import { RegistrationForm } from '@/features/registration/components/RegistrationForm'
import { SSEConnectionStatus } from '@/features/registration/components/SSEConnectionStatus'
import { useRegistrationRealtime } from '@/features/registration/hooks/use-registration-realtime'
import { useRegistrationStore } from '@/features/registration/store/registration-store'
import { User } from '@/features/registration/types'

export default function DashboardPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { data: usersData, isLoading, error } = useUsersQuery({ limit: 5 })
  const { realtimeStats } = useRegistrationStore()

  // Initialize realtime connection
  useRegistrationRealtime()

  const handleUserCreated = (user: User) => {
    console.log('New user created:', user)
    setShowCreateForm(false)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Visão geral do sistema e cadastro rápido
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Usuários
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : realtimeStats.totalUsers || usersData?.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuários Ativos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : realtimeStats.activeUsers || (usersData?.total || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Novos (Último mês)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {isLoading ? '...' : realtimeStats.newUsersThisMonth || Math.floor((usersData?.total || 0) * 0.2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SSE Connection Status */}
          <div className="lg:col-span-1">
            <SSEConnectionStatus />
          </div>

          {/* Recent Users */}
          <div className="bg-white shadow rounded-lg lg:col-span-1">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Usuários Recentes
                </h3>
                <a
                  href="/users"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Ver todos →
                </a>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {usersData?.data.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum usuário cadastrado ainda
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Registration */}
          <div className="bg-white shadow rounded-lg lg:col-span-1">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Cadastro Rápido
                </h3>
              </div>

              {showCreateForm ? (
                <RegistrationForm
                  mode="create"
                  onSuccess={handleUserCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-600 text-xl font-bold">+</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Cadastre um novo usuário rapidamente
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Novo Cadastro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}