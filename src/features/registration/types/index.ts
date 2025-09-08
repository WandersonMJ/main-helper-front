export interface User {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: Address
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  phone?: string
  dateOfBirth?: string
  address?: Omit<Address, 'id'>
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: Omit<Address, 'id'>
}

export interface UserFilters {
  name?: string
  email?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}