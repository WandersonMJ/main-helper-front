import { IUserService } from './user-service.interface'
import { IUserRepository } from '../repositories/user-repository.interface'
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, PaginatedResponse } from '../types'

export class UserServiceImpl implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    return this.userRepository.getUsers(filters)
  }

  async getUserById(id: string): Promise<User> {
    if (!id?.trim()) {
      throw new Error('User ID is required')
    }
    return this.userRepository.getUserById(id)
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const validation = await this.validateUserData(data)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const normalizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
    }

    return this.userRepository.createUser(normalizedData)
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    if (!id?.trim()) {
      throw new Error('User ID is required')
    }

    const normalizedData = {
      ...data,
      ...(data.email && { email: data.email.toLowerCase().trim() }),
      ...(data.name && { name: data.name.trim() }),
    }

    return this.userRepository.updateUser(id, normalizedData)
  }

  async deleteUser(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('User ID is required')
    }
    return this.userRepository.deleteUser(id)
  }

  async validateUserData(data: CreateUserRequest): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('Nome é obrigatório')
    }

    if (!data.email?.trim()) {
      errors.push('Email é obrigatório')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email deve ter um formato válido')
    }

    if (!data.password?.trim()) {
      errors.push('Senha é obrigatória')
    } else if (data.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres')
    }

    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.push('Telefone deve ter um formato válido')
    }

    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth)
      const today = new Date()
      if (birthDate >= today) {
        errors.push('Data de nascimento deve ser no passado')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}