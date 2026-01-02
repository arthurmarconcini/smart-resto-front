import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import type { Company } from '@/types'

export interface User {
  id: string
  name: string
  email: string
  companyId: string
}

interface AuthState {
  user: User | null
  company: Company | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  refreshProfile: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      logout: () => set({ user: null, company: null, token: null, isAuthenticated: false }),
      refreshProfile: async () => {
        try {
          const response = await api.get('/auth/me')
          set({ user: response.data.user, company: response.data.company })
        } catch (error) {
          const apiError = error as { response?: { status: number } }
          if (apiError.response?.status === 401) {
            set({ user: null, company: null, token: null, isAuthenticated: false })
          }
        }
      },
    }),
    {
      name: 'smart-resto-auth',
    }
  )
)
