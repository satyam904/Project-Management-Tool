import { Calendar, Hash } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import type { Task } from '../../types/task'
import { formatDate } from '../../utils/date'
import { clsx } from 'clsx'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'

  const priorityMap: Record<string, string> = {
    low: 'low',
    medium: 'medium',
    high: 'high'
  }

  return (
    <Card 
      onClick={onClick} 
      className="p-0 border border-border-default/60 group bg-background shadow-sm hover:shadow-md"
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-semibold text-text-h leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {task.title}
          </div>
          <div className="shrink-0 flex items-center text-[10px] font-semibold text-text-muted opacity-40 group-hover:opacity-100 transition-opacity">
            <Hash className="w-3 h-3 mr-0.5" />
            {task.id.slice(0, 4)}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={priorityMap[task.priority]}>{task.priority}</Badge>
        </div>

        <div className="flex items-center justify-between pt-1 mt-auto">
          <div className={clsx(
            'flex items-center gap-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md transition-colors',
            isOverdue 
              ? 'text-red-600 bg-red-50' 
              : 'text-text-muted group-hover:text-text-h'
          )}>
            {task.due_date && (
              <>
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.due_date)}</span>
              </>
            )}
          </div>
          
          {task.assigned_to && (
            <div className="flex items-center gap-2">
              <Avatar 
                name={`${task.assigned_to.first_name} ${task.assigned_to.last_name}`} 
                size="sm" 
                className="ring-2 ring-background"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
