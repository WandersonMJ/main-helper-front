import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { httpClient } from '@/shared/services/http-client'

interface UpdateProfileRequest {
  name?: string
  email?: string
  avatar?: string
}

interface UserProfileData {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
  settings?: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    language: string
  }
}

const userProfileService = {
  async getProfile(userId: string): Promise<UserProfileData> {
    const response = await httpClient.get<UserProfileData>(`/users/${userId}`)
    return response.data
  },

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfileData> {
    const response = await httpClient.put<UserProfileData>(`/users/${userId}`, data)
    return response.data
  },

  async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await httpClient.post<{ avatarUrl: string }>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export const useUserProfile = () => {
  const queryClient = useQueryClient()
  const { user, isAuthenticated, updateUser } = useAuth() // Reutilizando a feature auth

  // Query para buscar perfil completo
  const {
    data: userProfile,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['user', 'profile', user?.id],
    queryFn: () => userProfileService.getProfile(user!.id),
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfileRequest }) =>
      userProfileService.updateProfile(userId, data),
    onSuccess: (updatedProfile) => {
      // Atualiza o store global de auth
      updateUser({
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.avatar,
      })
      
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Mutation para upload de avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: ({ userId, file }: { userId: string; file: File }) =>
      userProfileService.uploadAvatar(userId, file),
    onSuccess: (data) => {
      // Atualiza o avatar no store global
      updateUser({ avatar: data.avatarUrl })
      
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  const updateProfile = async (data: UpdateProfileRequest) => {
    if (!user?.id) throw new Error('Usuário não autenticado')
    
    return updateProfileMutation.mutateAsync({
      userId: user.id,
      data,
    })
  }

  const uploadAvatar = async (file: File) => {
    if (!user?.id) throw new Error('Usuário não autenticado')
    
    return uploadAvatarMutation.mutateAsync({
      userId: user.id,
      file,
    })
  }

  return {
    // Dados do usuário (vem da feature auth)
    user,
    isAuthenticated,
    
    // Dados completos do perfil
    userProfile,
    isLoadingProfile,
    profileError,
    
    // Loading states
    isUpdatingProfile: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    
    // Errors
    updateError: updateProfileMutation.error,
    uploadError: uploadAvatarMutation.error,
    
    // Actions
    updateProfile,
    uploadAvatar,
    refetchProfile,
    
    // Mutations para acesso direto
    updateProfileMutation,
    uploadAvatarMutation,
  }
}