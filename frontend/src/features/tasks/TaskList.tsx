import React, { useState, useRef } from 'react'
import { Plus, Search, Filter, GripVertical } from 'lucide-react'
import { useTasks, useUpdateTask } from './useTasks'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { TaskDetailPanel } from './TaskDetailPanel'
import type { Task, TaskStatus } from '../../types/task'
import type { ProjectMember } from '../../types/project'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

interface TaskListProps {
  projectId: string
  members: ProjectMember[]
}

export function TaskList({ projectId, members }: TaskListProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo')
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Drag and drop state
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const dragCounter = useRef<Record<string, number>>({})

  const updateTask = useUpdateTask(projectId)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: tasksData, isLoading } = useTasks(projectId, {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined
  })

  const tasks = tasksData?.results || []

  const columns: { id: TaskStatus; title: string; color: string; dotColor: string }[] = [
    { id: 'todo', title: 'To Do', color: 'border-text-muted/30', dotColor: 'bg-text-muted ring-text-muted/10' },
    { id: 'in-progress', title: 'In Progress', color: 'border-primary/40', dotColor: 'bg-primary ring-primary/10' },
    { id: 'done', title: 'Completed', color: 'border-green-500/40', dotColor: 'bg-success ring-success/10' }
  ]

  const handleAddTask = (status: TaskStatus) => {
    setInitialStatus(status)
    setFormOpen(true)
  }

  const handleCardClick = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  // === Drag & Drop Handlers ===
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
    // Make the drag image slightly transparent
    const el = e.currentTarget as HTMLElement
    setTimeout(() => el.style.opacity = '0.4', 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.style.opacity = '1'
    setDraggedTask(null)
    setDragOverColumn(null)
    dragCounter.current = {}
  }

  const handleDragEnterColumn = (e: React.DragEvent, columnId: TaskStatus) => {
    e.preventDefault()
    dragCounter.current[columnId] = (dragCounter.current[columnId] || 0) + 1
    setDragOverColumn(columnId)
  }

  const handleDragLeaveColumn = (e: React.DragEvent, columnId: TaskStatus) => {
    dragCounter.current[columnId] = (dragCounter.current[columnId] || 0) - 1
    if (dragCounter.current[columnId] <= 0) {
      dragCounter.current[columnId] = 0
      if (dragOverColumn === columnId) {
        setDragOverColumn(null)
      }
    }
  }

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOnColumn = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    dragCounter.current = {}
    setDragOverColumn(null)

    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null)
      return
    }

    // Optimistically update the status
    const taskId = draggedTask.id
    const oldStatus = draggedTask.status
    setDraggedTask(null)

    updateTask.mutate(
      { id: taskId, status: targetStatus },
      {
        onSuccess: () => {
          toast.success(`Task moved to ${columns.find(c => c.id === targetStatus)?.title}`)
        },
        onError: () => {
          toast.error('Failed to move task')
        }
      }
    )
  }

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-xl border border-border-default">
        <div className="relative flex-1 min-w-[200px] group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Filter tasks by title..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <select
              className="pl-9 pr-3 py-2 text-sm bg-background border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary appearance-none cursor-pointer transition-all min-w-[130px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
          
          <select
            className="px-3 py-2 text-sm bg-background border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary appearance-none cursor-pointer transition-all min-w-[130px]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id)
          const isDropTarget = dragOverColumn === col.id && draggedTask?.status !== col.id

          return (
            <div key={col.id} className="flex flex-col w-80 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    'w-1.5 h-1.5 rounded-full ring-4 ring-offset-2 ring-offset-background transition-shadow',
                    col.dotColor
                  )} />
                  <h3 className="font-display font-bold text-text-h text-[11px] uppercase tracking-[0.15em]">{col.title}</h3>
                  <span className="text-[10px] font-semibold text-text-muted/40 ml-0.5">
                    {colTasks.length}
                  </span>
                </div>
              </div>
              
              {/* Drop zone */}
              <div
                className={clsx(
                  'flex-1 border-2 border-dashed rounded-xl p-3 flex flex-col gap-3 min-h-[400px] transition-all duration-200',
                  isDropTarget
                    ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10'
                    : 'bg-surface/50 border-border-default hover:border-border-strong/50'
                )}
                onDragEnter={(e) => handleDragEnterColumn(e, col.id)}
                onDragLeave={(e) => handleDragLeaveColumn(e, col.id)}
                onDragOver={handleDragOverColumn}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
              >
                {/* Drop indicator */}
                {isDropTarget && (
                  <div className="flex items-center justify-center py-3 mb-1 border-2 border-primary/30 border-dashed rounded-lg bg-primary/5 animate-pulse">
                    <span className="text-xs font-bold text-primary">Drop here to move</span>
                  </div>
                )}

                {colTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className={clsx(
                      'cursor-grab active:cursor-grabbing transition-all duration-200 group/drag',
                      draggedTask?.id === task.id && 'opacity-40 scale-95'
                    )}
                  >
                    <div className="relative">
                      {/* Grip handle visible on hover */}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/drag:opacity-60 transition-opacity z-10 pointer-events-none">
                        <GripVertical className="w-4 h-4 text-text-muted" />
                      </div>
                      <TaskCard
                        task={task}
                        onClick={() => handleCardClick(task.id)}
                      />
                    </div>
                  </div>
                ))}

                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => handleAddTask(col.id)}
                    className="flex items-center justify-center w-full py-2.5 text-sm font-medium text-text-muted hover:text-primary hover:bg-primary-bg rounded-lg border border-dashed border-border-default hover:border-primary/30 transition-all mt-1"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Task
                  </button>
                )}

                {isLoading && colTasks.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 gap-3 animate-pulse">
                    <div className="w-full h-20 bg-background/50 rounded-lg" />
                    <div className="w-full h-20 bg-background/50 rounded-lg" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <TaskForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        projectId={projectId}
        members={members}
        initialStatus={initialStatus}
      />

      <TaskDetailPanel
        taskId={selectedTaskId}
        projectId={projectId}
        members={members}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  )
}
