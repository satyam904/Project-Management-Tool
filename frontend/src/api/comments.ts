import client from './client'
import type { TaskComment } from '../types/task'
import type { ApiResponse } from '../types/common'

export async function addComment(taskId: string, content: string) {
  const { data } = await client.post<ApiResponse<TaskComment>>(`/api/v1/tasks/${taskId}/comments/`, { content })
  return data.data
}

export async function deleteComment(taskId: string, commentId: string) {
  await client.delete(`/api/v1/tasks/${taskId}/comments/${commentId}/`)
}
