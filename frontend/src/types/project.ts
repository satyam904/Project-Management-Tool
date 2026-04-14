export type ProjectStatus = 'active' | 'completed'
export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface Project {
  id: string
  title: string
  description: string | null
  status: ProjectStatus
  deadline: string | null
  member_count: number
  task_count: number
  created_at: string
}

export interface ProjectDetail extends Project {
  owner: import('./auth').User
  members: ProjectMember[]
}

export interface ProjectMember {
  id: string
  user: import('./auth').User
  role: MemberRole
  joined_at: string
}

export interface CreateProjectPayload {
  title: string
  description?: string
  status?: ProjectStatus
  deadline?: string
}
