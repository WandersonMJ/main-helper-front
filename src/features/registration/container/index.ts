import axios from 'axios'
import { UserRepositoryImpl } from '../repositories/user-repository.impl'
import { UserServiceImpl } from '../services/user-service.impl'
import { UserSSEService } from '../services/user-sse-service'
import { IUserRepository } from '../repositories/user-repository.interface'
import { IUserService } from '../services/user-service.interface'

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

class DIContainer {
  private instances = new Map<string, any>()

  register<T>(key: string, factory: () => T): void {
    this.instances.set(key, factory)
  }

  resolve<T>(key: string): T {
    const factory = this.instances.get(key)
    if (!factory) {
      throw new Error(`No factory registered for key: ${key}`)
    }
    return factory()
  }

  singleton<T>(key: string, factory: () => T): void {
    let instance: T | null = null
    this.register(key, () => {
      if (!instance) {
        instance = factory()
      }
      return instance
    })
  }
}

const container = new DIContainer()

container.singleton<IUserRepository>('UserRepository', () => new UserRepositoryImpl(httpClient))
container.singleton<IUserService>('UserService', () => {
  const userRepository = container.resolve<IUserRepository>('UserRepository')
  return new UserServiceImpl(userRepository)
})
container.singleton<UserSSEService>('UserSSEService', () => new UserSSEService())

export { container }
export type { IUserService, IUserRepository }