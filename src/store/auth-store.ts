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
  updateCompany: (companyData: Partial<Company>) => void
  isCompanyConfigured: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
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
      updateCompany: (companyData) =>
        set((state) => ({
          company: state.company ? { ...state.company, ...companyData } : null,
        })),
      isCompanyConfigured: () => {
        const company = get().company
        if (!company) return false
        return (
          (company.monthlyFixedCost ?? 0) > 0 && (company.desiredProfit ?? 0) > 0
        )
      },
    }),
    {
      name: 'smart-resto-auth',
    }
  )
)
