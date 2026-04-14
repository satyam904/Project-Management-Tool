export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  order_index: number
  assigned_to: import('./auth').User | null
  created_at: string
}

export interface TaskDetail extends Task {
  created_by: import('./auth').User
  project_id: string
  comment_count: number
}

export interface TaskComment {
  id: string
  content: string
  user: import('./auth').User
  created_at: string
  updated_at: string
}

export interface CreateTaskPayload {
  project: string
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  assigned_to?: string
}
