import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PaginatedResponse } from '../types'

export interface IUserRepository {
  getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>>
  getUserById(id: string): Promise<User>
  createUser(data: CreateUserRequest): Promise<User>
  updateUser(id: string, data: UpdateUserRequest): Promise<User>
  deleteUser(id: string): Promise<void>
}