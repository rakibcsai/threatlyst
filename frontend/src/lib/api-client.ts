import axios from 'axios'
import { env } from '../config/env'
import { authStorage } from './auth-storage'

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

let unauthorizedHandler: (() => void) | undefined

export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  unauthorizedHandler = handler
}

apiClient.interceptors.request.use((config) => {
  const token = authStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authStorage.clear()
      unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)
