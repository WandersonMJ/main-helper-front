import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/shared/stores/auth-store'
import { authService, LoginRequest, RegisterRequest } from '../services/auth-service'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const { user, isAuthenticated, login: loginStore, logout: logoutStore, updateUser } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      loginStore(data.user, data.token)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      loginStore(data.user, data.token)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
    },
  })

  // Get profile query
  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const login = async (credentials: LoginRequest) => {
    return loginMutation.mutateAsync(credentials)
  }

  const register = async (userData: RegisterRequest) => {
    return registerMutation.mutateAsync(userData)
  }

  const logout = async () => {
    return logoutMutation.mutateAsync()
  }

  return {
    // Estado
    user,
    isAuthenticated,
    profile,
    
    // Loading states
    isLoadingLogin: loginMutation.isPending,
    isLoadingRegister: registerMutation.isPending,
    isLoadingLogout: logoutMutation.isPending,
    isLoadingProfile,
    
    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    refetchProfile,
    
    // Mutations para acesso direto se necessário
    loginMutation,
    registerMutation,
    logoutMutation,
  }
}