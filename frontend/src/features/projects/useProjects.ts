import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../../api/projects'
import type { CreateProjectPayload } from '../../types/project'

export function useProjects(params?: { search?: string; status?: string; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => listProjects(params),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateProjectPayload> }) => updateProject(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
