import { httpClient } from '@/shared/services/http-client'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  token: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/register', userData)
    return response.data
  },

  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/refresh')
    return response.data
  },

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await httpClient.get<AuthResponse['user']>('/auth/profile')
    return response.data
  },
}