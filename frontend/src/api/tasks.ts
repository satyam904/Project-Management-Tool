import client from './client'
import type { Task, TaskDetail, CreateTaskPayload } from '../types/task'
import type { PaginatedResponse, ApiResponse } from '../types/common'

export async function listTasks(projectId?: string, params?: { status?: string; priority?: string; assigned_to?: string; search?: string }) {
  const { data } = await client.get<ApiResponse<PaginatedResponse<Task>>>(`/api/v1/tasks/`, { params: { ...params, project: projectId } })
  return data.data
}

export async function getTask(taskId: string) {
  const { data } = await client.get<ApiResponse<TaskDetail>>(`/api/v1/tasks/${taskId}/`)
  return data.data
}

export async function createTask(payload: CreateTaskPayload) {
  const { data } = await client.post<ApiResponse<Task>>(`/api/v1/tasks/`, payload)
  return data.data
}

export async function updateTask(taskId: string, payload: Partial<CreateTaskPayload>) {
  const { data } = await client.patch<ApiResponse<Task>>(`/api/v1/tasks/${taskId}/`, payload)
  return data.data
}

export async function deleteTask(taskId: string) {
  await client.delete(`/api/v1/tasks/${taskId}/`)
}

export async function listComments(taskId: string) {
  const { data } = await client.get<ApiResponse<PaginatedResponse<import('../types/task').TaskComment>>>(`/api/v1/tasks/${taskId}/comments/`)
  return data.data
}

export async function createComment(taskId: string, content: string) {
  const { data } = await client.post<ApiResponse<import('../types/task').TaskComment>>(`/api/v1/tasks/${taskId}/comments/`, { content })
  return data.data
}
