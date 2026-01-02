import axios from 'axios'
import { useAuth } from '@/store/auth-store'

export const api = axios.create({
  baseURL: 'https://smart-resto-api.onrender.com',
})

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
