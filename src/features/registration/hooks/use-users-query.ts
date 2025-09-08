import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { container, IUserService } from '../container'
import { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../types'

const QUERY_KEYS = {
  users: (filters?: UserFilters) => ['users', filters],
  user: (id: string) => ['user', id],
} as const

export function useUsersQuery(filters?: UserFilters) {
  const userService = container.resolve<IUserService>('UserService')
  
  return useQuery({
    queryKey: QUERY_KEYS.users(filters),
    queryFn: () => userService.getUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUserQuery(id: string) {
  const userService = container.resolve<IUserService>('UserService')
  
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  const userService = container.resolve<IUserService>('UserService')
  
  return useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),
    onSuccess: (newUser: User) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.setQueryData(QUERY_KEYS.user(newUser.id), newUser)
    },
    onError: (error) => {
      console.error('Error creating user:', error)
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  const userService = container.resolve<IUserService>('UserService')
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      userService.updateUser(id, data),
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.setQueryData(QUERY_KEYS.user(updatedUser.id), updatedUser)
    },
    onError: (error) => {
      console.error('Error updating user:', error)
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  const userService = container.resolve<IUserService>('UserService')
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.user(deletedId) })
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
    },
  })
}