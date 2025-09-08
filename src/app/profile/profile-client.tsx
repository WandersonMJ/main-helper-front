'use client'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { useUserProfile } from '@/features/user-profile/hooks/use-user-profile'
import { Button } from '@/components/atoms/Button'

export function ProfileClient() {
  const { user, isAuthenticated, logout } = useAuth()
  const { 
    userProfile, 
    isLoadingProfile, 
    updateProfile, 
    isUpdatingProfile,
    uploadAvatar,
    isUploadingAvatar 
  } = useUserProfile()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p>Você precisa estar logado para ver esta página.</p>
        </div>
      </div>
    )
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        name: 'Novo Nome',
      })
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      alert('Erro ao atualizar perfil')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadAvatar(file)
      alert('Avatar atualizado com sucesso!')
    } catch (error) {
      alert('Erro ao fazer upload do avatar')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <Button 
              variant="outline" 
              onClick={logout}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button 
                      // as="span" 
                      size="sm" 
                      variant="outline"
                      isLoading={isUploadingAvatar}
                    >
                      Alterar Avatar
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-gray-900">{userProfile?.name || user?.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{userProfile?.email || user?.email}</p>
              </div>

              {userProfile?.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membro desde
                  </label>
                  <p className="text-gray-900">
                    {new Date(userProfile.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {userProfile?.settings && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configurações
                  </label>
                  <div className="text-sm text-gray-600">
                    <p>Tema: {userProfile.settings.theme}</p>
                    <p>Notificações: {userProfile.settings.notifications ? 'Ativadas' : 'Desativadas'}</p>
                    <p>Idioma: {userProfile.settings.language}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <Button 
                onClick={handleUpdateProfile}
                isLoading={isUpdatingProfile}
              >
                Atualizar Perfil
              </Button>
              
              <Button variant="outline">
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}