import { useState, useEffect } from 'react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { useTasks } from './useTasks'
import { TaskCard } from './TaskCard'
import { TaskDetailPanel } from './TaskDetailPanel'
import { Search, CheckSquare } from 'lucide-react'
import { Skeleton } from '../../components/ui/Skeleton'
import { clsx } from 'clsx'

export function TasksPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data: tasksData, isLoading } = useTasks('', {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined
  })

  const tasks = tasksData?.results || []

  return (
    <PageWrapper title="My Tasks">
      <div className="flex flex-col h-full gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-5 rounded-xl border border-border-default">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-text-h">Global Task Manager</h2>
              <p className="text-xs text-text-muted mt-0.5">Manage tasks across all your projects.</p>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all w-full md:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-1 border-b border-border-default">
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mr-1">Status:</span>
             <div className="flex bg-surface p-1 rounded-lg border border-border-default gap-0.5">
                {['', 'todo', 'in-progress', 'done'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={clsx(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-all capitalize',
                      statusFilter === s ? 'bg-background text-primary shadow-sm border border-border-default/50' : 'text-text-muted hover:text-text-h hover:bg-surface-hover'
                    )}
                  >
                    {s || 'All'}
                  </button>
                ))}
             </div>
           </div>

           <div className="flex items-center gap-2">
             <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mr-1">Priority:</span>
             <div className="flex bg-surface p-1 rounded-lg border border-border-default gap-0.5">
                {['', 'low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={clsx(
                      'px-2.5 py-1 text-xs font-medium rounded-md transition-all capitalize',
                      priorityFilter === p ? 'bg-background text-primary shadow-sm border border-border-default/50' : 'text-text-muted hover:text-text-h hover:bg-surface-hover'
                    )}
                  >
                    {p || 'All'}
                  </button>
                ))}
             </div>
           </div>
        </div>

        {/* Task Grid */}
        <div className="flex-1 overflow-auto min-h-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-36 w-full rounded-xl" />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onClick={() => setSelectedTaskId(task.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 bg-surface/30 border border-border-default border-dashed rounded-xl">
              <CheckSquare className="w-10 h-10 text-text-muted/20 mb-3" />
              <p className="font-display font-bold text-text-h">No tasks found</p>
              <p className="text-sm text-text-muted mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>

        {selectedTaskId && (
          <TaskDetailPanel
            taskId={selectedTaskId}
            projectId=""
            members={[]}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </PageWrapper>
  )
}
