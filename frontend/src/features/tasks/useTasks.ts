import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../../api/tasks'
import type { CreateTaskPayload } from '../../types/task'

export function useTasks(projectId?: string, filters?: { status?: string; priority?: string; assigned_to?: string; search?: string }) {
  return useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => api.listTasks(projectId, filters),
  })
}


export function useTask(taskId: string) {
  return useQuery({
    queryKey: ['tasks', 'detail', taskId],
    queryFn: () => api.getTask(taskId),
    enabled: !!taskId,
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<CreateTaskPayload, 'project'>) => api.createTask({ ...payload, project: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      // Also invalidate project to update task_count
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<CreateTaskPayload> & { id: string }) => api.updateTask(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', variables.id] })
      // Also invalidate project to update status/task_count
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },

  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => api.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      // Invalidate project
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
  })
}

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => api.listComments(taskId),
    enabled: !!taskId,
  })
}

export function useAddComment(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => api.createComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
    },
  })
}
