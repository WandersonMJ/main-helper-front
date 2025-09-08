import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PaginatedResponse } from '../types'

export interface IUserService {
  getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>>
  getUserById(id: string): Promise<User>
  createUser(data: CreateUserRequest): Promise<User>
  updateUser(id: string, data: UpdateUserRequest): Promise<User>
  deleteUser(id: string): Promise<void>
  validateUserData(data: CreateUserRequest): Promise<{ isValid: boolean; errors: string[] }>
}