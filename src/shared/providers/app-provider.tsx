'use client'

import { createContext, useContext, useReducer } from 'react'
import { User } from '@/types'

interface AppState {
  user: User | null
  isLoading: boolean
  error: string | null
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  login: (user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const initialState: AppState = {
  user: null,
  isLoading: false,
  error: null,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'LOGOUT':
      return { ...state, user: null, error: null }
    default:
      return state
  }
}

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AppContextType = {
    state,
    dispatch,
    login,
    logout,
    setLoading,
    setError,
    clearError,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}