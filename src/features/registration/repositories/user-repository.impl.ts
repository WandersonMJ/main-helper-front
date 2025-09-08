import { AxiosInstance } from 'axios'
import { IUserRepository } from './user-repository.interface'
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PaginatedResponse } from '../types'

export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly httpClient: AxiosInstance) {}

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const response = await this.httpClient.get<PaginatedResponse<User>>('/users', {
      params: filters,
    })
    return response.data
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.httpClient.get<User>(`/users/${id}`)
    return response.data
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.httpClient.post<User>('/users', data)
    return response.data
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await this.httpClient.put<User>(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string): Promise<void> {
    await this.httpClient.delete(`/users/${id}`)
  }
}