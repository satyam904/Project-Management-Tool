import client from './client'
import type { User, LoginPayload, RegisterPayload } from '../types/auth'
import type { ApiResponse } from '../types/common'

export async function login(payload: LoginPayload) {
  const { data } = await client.post<ApiResponse<{ access: string; refresh: string; user: User }>>('/api/v1/auth/login/', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await client.post<ApiResponse<{ access: string; refresh: string; user: User }>>('/api/v1/auth/register/', payload)
  return data
}

export async function logout(refresh: string) {
  await client.post('/api/v1/auth/logout/', { refresh_token: refresh })
}

export async function getMe() {
  const { data } = await client.get<ApiResponse<User>>('/api/v1/auth/me/')
  return data.data
}

export async function updateMe(payload: Partial<User>) {
  const { data } = await client.patch<ApiResponse<User>>('/api/v1/auth/me/', payload)
  return data.data
}

export async function changePassword(payload: any) {
  const { data } = await client.post<ApiResponse<void>>('/api/v1/auth/change-password/', payload)
  return data
}

