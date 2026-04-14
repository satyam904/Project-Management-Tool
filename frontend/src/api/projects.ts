import client from './client'
import type { Project, ProjectDetail, CreateProjectPayload, ProjectMember, MemberRole } from '../types/project'
import type { PaginatedResponse, ApiResponse } from '../types/common'

export async function listProjects(params?: { search?: string; status?: string; page?: number; page_size?: number }) {
  const { data } = await client.get<ApiResponse<PaginatedResponse<Project>>>('/api/v1/projects/', { params })
  return data.data
}

export async function getProject(id: string) {
  const { data } = await client.get<ApiResponse<ProjectDetail>>(`/api/v1/projects/${id}/`)
  return data.data
}

export async function createProject(payload: CreateProjectPayload) {
  const { data } = await client.post<ApiResponse<Project>>('/api/v1/projects/', payload)
  return data.data
}

export async function updateProject(id: string, payload: Partial<CreateProjectPayload>) {
  const { data } = await client.patch<ApiResponse<Project>>(`/api/v1/projects/${id}/`, payload)
  return data.data
}

export async function deleteProject(id: string) {
  await client.delete(`/api/v1/projects/${id}/`)
}

export async function addMember(projectId: string, email: string, role: MemberRole) {
  const { data } = await client.post<ApiResponse<ProjectMember>>(`/api/v1/projects/${projectId}/members/`, { user_email: email, role })
  return data.data
}

export async function removeMember(projectId: string, memberId: string) {
  await client.delete(`/api/v1/projects/${projectId}/members/${memberId}/`)
}
