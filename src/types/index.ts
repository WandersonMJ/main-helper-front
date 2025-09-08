export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  status?: number
}