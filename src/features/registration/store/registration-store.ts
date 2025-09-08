import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { container, IUserService } from '../container'
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PaginatedResponse } from '../types'
import { UserSSEService } from '../services/user-sse-service'
import { UserEventData, UserCreatedData, UserUpdatedData, UserDeletedData, StatsUpdatedData } from '../types/sse'
import { SSEConnectionState } from '@/shared/services/sse-service'

interface RegistrationState {
  users: User[]
  currentUser: User | null
  paginationData: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  filters: UserFilters
  isLoading: boolean
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  error: string | null
  
  // SSE State
  sseConnectionState: SSEConnectionState
  realtimeStats: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    lastUpdated?: Date
  }
  realtimeEnabled: boolean
}

interface RegistrationActions {
  // Users list
  fetchUsers: (filters?: UserFilters) => Promise<void>
  setFilters: (filters: UserFilters) => void
  clearUsers: () => void
  
  // Single user
  fetchUserById: (id: string) => Promise<void>
  setCurrentUser: (user: User | null) => void
  
  // CRUD operations
  createUser: (data: CreateUserRequest) => Promise<User>
  updateUser: (id: string, data: UpdateUserRequest) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  
  // SSE Actions
  enableRealtime: () => void
  disableRealtime: () => void
  handleUserCreated: (data: UserCreatedData) => void
  handleUserUpdated: (data: UserUpdatedData) => void
  handleUserDeleted: (data: UserDeletedData) => void
  handleStatsUpdated: (data: StatsUpdatedData) => void
  setSSEConnectionState: (state: SSEConnectionState) => void
  
  // Utilities
  clearError: () => void
  reset: () => void
}

type RegistrationStore = RegistrationState & RegistrationActions

const initialState: RegistrationState = {
  users: [],
  currentUser: null,
  paginationData: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  // SSE State
  sseConnectionState: {
    status: 'disconnected',
    reconnectAttempts: 0,
  },
  realtimeStats: {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
  },
  realtimeEnabled: false,
}

export const useRegistrationStore = create<RegistrationStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Users list
        fetchUsers: async (filters?: UserFilters) => {
          set({ isLoading: true, error: null })
          try {
            const userService = container.resolve<IUserService>('UserService')
            const finalFilters = { ...get().filters, ...filters }
            
            const response: PaginatedResponse<User> = await userService.getUsers(finalFilters)
            
            set({
              users: response.data,
              paginationData: {
                total: response.total,
                page: response.page,
                limit: response.limit,
                totalPages: response.totalPages,
              },
              filters: finalFilters,
              isLoading: false,
            })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erro ao buscar usuários',
              isLoading: false,
            })
          }
        },

        setFilters: (filters: UserFilters) => {
          set({ filters })
        },

        clearUsers: () => {
          set({ users: [], paginationData: initialState.paginationData })
        },

        // Single user
        fetchUserById: async (id: string) => {
          set({ isLoading: true, error: null })
          try {
            const userService = container.resolve<IUserService>('UserService')
            const user = await userService.getUserById(id)
            set({ currentUser: user, isLoading: false })
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Erro ao buscar usuário',
              isLoading: false,
              currentUser: null,
            })
          }
        },

        setCurrentUser: (user: User | null) => {
          set({ currentUser: user })
        },

        // CRUD operations
        createUser: async (data: CreateUserRequest) => {
          set({ isCreating: true, error: null })
          try {
            const userService = container.resolve<IUserService>('UserService')
            const newUser = await userService.createUser(data)
            
            set((state) => ({
              users: [newUser, ...state.users],
              isCreating: false,
              currentUser: newUser,
            }))
            
            return newUser
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário'
            set({
              error: errorMessage,
              isCreating: false,
            })
            throw error
          }
        },

        updateUser: async (id: string, data: UpdateUserRequest) => {
          set({ isUpdating: true, error: null })
          try {
            const userService = container.resolve<IUserService>('UserService')
            const updatedUser = await userService.updateUser(id, data)
            
            set((state) => ({
              users: state.users.map((user) => 
                user.id === id ? updatedUser : user
              ),
              currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser,
              isUpdating: false,
            }))
            
            return updatedUser
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário'
            set({
              error: errorMessage,
              isUpdating: false,
            })
            throw error
          }
        },

        deleteUser: async (id: string) => {
          set({ isDeleting: true, error: null })
          try {
            const userService = container.resolve<IUserService>('UserService')
            await userService.deleteUser(id)
            
            set((state) => ({
              users: state.users.filter((user) => user.id !== id),
              currentUser: state.currentUser?.id === id ? null : state.currentUser,
              isDeleting: false,
            }))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar usuário'
            set({
              error: errorMessage,
              isDeleting: false,
            })
            throw error
          }
        },

        // SSE Actions
        enableRealtime: () => {
          set({ realtimeEnabled: true })
          const sseService = container.resolve<UserSSEService>('UserSSEService')
          sseService.connect()
        },

        disableRealtime: () => {
          set({ realtimeEnabled: false })
          const sseService = container.resolve<UserSSEService>('UserSSEService')
          sseService.disconnect()
        },

        handleUserCreated: (data: UserCreatedData) => {
          set((state) => ({
            users: [data.user, ...state.users],
            realtimeStats: {
              ...state.realtimeStats,
              totalUsers: state.realtimeStats.totalUsers + 1,
              lastUpdated: new Date(),
            },
          }))
        },

        handleUserUpdated: (data: UserUpdatedData) => {
          set((state) => ({
            users: state.users.map((user) => 
              user.id === data.user.id ? data.user : user
            ),
            currentUser: state.currentUser?.id === data.user.id ? data.user : state.currentUser,
            realtimeStats: {
              ...state.realtimeStats,
              lastUpdated: new Date(),
            },
          }))
        },

        handleUserDeleted: (data: UserDeletedData) => {
          set((state) => ({
            users: state.users.filter((user) => user.id !== data.userId),
            currentUser: state.currentUser?.id === data.userId ? null : state.currentUser,
            realtimeStats: {
              ...state.realtimeStats,
              totalUsers: Math.max(0, state.realtimeStats.totalUsers - 1),
              lastUpdated: new Date(),
            },
          }))
        },

        handleStatsUpdated: (data: StatsUpdatedData) => {
          set({
            realtimeStats: {
              totalUsers: data.totalUsers,
              activeUsers: data.activeUsers,
              newUsersThisMonth: data.newUsersThisMonth,
              lastUpdated: new Date(),
            },
          })
        },

        setSSEConnectionState: (state: SSEConnectionState) => {
          set({ sseConnectionState: state })
        },

        // Utilities
        clearError: () => {
          set({ error: null })
        },

        reset: () => {
          set(initialState)
        },
      }),
      {
        name: 'registration-store',
        partialize: (state) => ({
          filters: state.filters,
          currentUser: state.currentUser,
        }),
      }
    ),
    { name: 'registration-store' }
  )
)

export type { RegistrationStore }