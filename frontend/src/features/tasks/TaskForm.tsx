import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useCreateTask, useUpdateTask } from './useTasks'
import type { Task, TaskStatus, TaskPriority } from '../../types/task'
import type { ProjectMember } from '../../types/project'
import toast from 'react-hot-toast'
import React from 'react'
import { Calendar, User, Tag, AlignLeft, Flag } from 'lucide-react'

const taskSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title is too short'),
  description: yup.string().optional(),
  status: yup.mixed<TaskStatus>().oneOf(['todo', 'in-progress', 'done']).default('todo'),
  priority: yup.mixed<TaskPriority>().oneOf(['low', 'medium', 'high']).default('medium'),
  due_date: yup.string().nullable().optional(),
  assigned_to: yup.string().nullable().optional()
})

type TaskFormData = yup.InferType<typeof taskSchema>

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  task?: Task
  members: ProjectMember[]
  initialStatus?: TaskStatus
}

export function TaskForm({ isOpen, onClose, projectId, task, members, initialStatus }: TaskFormProps) {
  const createMut = useCreateTask(projectId)
  const updateMut = useUpdateTask(projectId)

  const formatDateTimeLocal = (isoString?: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return ''
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormData>({
    resolver: yupResolver(taskSchema) as any,
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || initialStatus || 'todo',
      priority: task?.priority || 'medium',
      due_date: formatDateTimeLocal(task?.due_date),
      assigned_to: task?.assigned_to?.id || ''
    }
  })

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || initialStatus || 'todo',
        priority: task?.priority || 'medium',
        due_date: formatDateTimeLocal(task?.due_date),
        assigned_to: task?.assigned_to?.id || ''
      })
    }
  }, [isOpen, task, initialStatus, reset])

  const onSubmit = (data: TaskFormData) => {
    const payload = {
      ...data,
      assigned_to: data.assigned_to || undefined,
      description: data.description || '',
      due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
    }

    if (task) {
      updateMut.mutate({ id: task.id, ...payload }, {
        onSuccess: () => {
          toast.success('Task updated successfully')
          onClose()
        },
        onError: () => toast.error('Failed to update task')
      })
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success('Task created successfully')
          onClose()
        },
        onError: () => toast.error('Failed to create task')
      })
    }
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add New Task'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
        <div className="space-y-6">
          <Input
            id="title"
            label="What needs to be done?"
            placeholder="e.g. Design system audit"
            {...register('title')}
            error={errors.title?.message}
            autoFocus
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-muted mb-1 ml-0.5">
              <AlignLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Details</span>
            </div>
            <Textarea
              id="description"
              placeholder="Add more context or specific requirements..."
              rows={4}
              {...register('description')}
              error={errors.description?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
               <div className="space-y-1">
                 <div className="flex items-center gap-2 text-text-muted mb-2 ml-0.5">
                   <Tag className="w-3.5 h-3.5" />
                   <span className="text-[11px] font-bold uppercase tracking-wider">Status & Priority</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                  <Select
                    id="status"
                    {...register('status')}
                    error={errors.status?.message}
                    options={[
                      { value: 'todo', label: 'To Do' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'done', label: 'Done' }
                    ]}
                  />
                  <Select
                    id="priority"
                    {...register('priority')}
                    error={errors.priority?.message}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
                    ]}
                  />
                 </div>
               </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-text-muted mb-2 ml-0.5">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Assignment</span>
                </div>
                <Select
                  id="assigned_to"
                  {...register('assigned_to')}
                  error={errors.assigned_to?.message}
                  options={[
                    { value: '', label: 'Unassigned' },
                    ...members.map(m => ({
                      value: m.user.id,
                      label: `${m.user.first_name} ${m.user.last_name}`
                    }))
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-muted mb-2 ml-0.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Target Date</span>
            </div>
            <Input
              id="due_date"
              type="datetime-local"
              {...register('due_date')}
              error={errors.due_date?.message}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-border-default/50">
          <Button type="button" variant="ghost" onClick={isPending ? undefined : onClose} disabled={isPending}>
            Discard Changes
          </Button>
          <Button type="submit" disabled={isPending} loading={isPending} className="shadow-sm min-w-[140px]">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
