export const APP_CONFIG = {
  name: 'Main Helper',
  version: '1.0.0',
  description: 'A modern Next.js application',
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  users: {
    profile: '/users/profile',
    update: '/users/update',
  },
} as const

export const ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  dashboard: '/dashboard',
  profile: '/profile',
} as const

export const BREAKPOINTS = {
  mobile: '640px',
  tablet: '768px',
  laptop: '1024px',
  desktop: '1280px',
} as const