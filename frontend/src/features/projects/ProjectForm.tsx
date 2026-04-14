import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { projectSchema } from '../../utils/validators'
import { useCreateProject, useUpdateProject } from './useProjects'
import toast from 'react-hot-toast'
import type { Project, CreateProjectPayload } from '../../types/project'
import { Calendar, Layout, MessageSquare } from 'lucide-react'

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  project?: Project | null
}

export function ProjectForm({ open, onClose, project }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateProjectPayload>({
    resolver: yupResolver(projectSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      status: 'active',
      deadline: ''
    }
  })

  useEffect(() => {
    if (project && open) {
      reset({
        title: project.title,
        description: project.description || '',
        status: project.status,
        deadline: project.deadline ? project.deadline.split('T')[0] : ''
      })
    } else if (open) {
      reset({
        title: '',
        description: '',
        status: 'active',
        deadline: ''
      })
    }
  }, [project, open, reset])

  const createMut = useCreateProject()
  const updateMut = useUpdateProject()
  const isPending = createMut.isPending || updateMut.isPending

  const onSubmit = (data: CreateProjectPayload) => {
    const payload = { ...data }
    if (!payload.deadline) delete payload.deadline

    if (project) {
      updateMut.mutate({ id: project.id, payload }, {
        onSuccess: () => {
          toast.success('Project updated successfully')
          onClose()
        },
        onError: () => toast.error('Failed to update project')
      })
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          toast.success('Project created successfully')
          onClose()
        },
        onError: () => toast.error('Failed to create project')
      })
    }
  }

  return (
    <Modal 
      open={open} 
      onClose={isPending ? () => {} : onClose} 
      title={project ? 'Project Details' : 'Create New Project'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-2">
        <div className="space-y-6">
          <Input 
            label="Project Name"
            placeholder="e.g. Q2 Product Launch"
            {...register('title')}
            error={errors.title?.message as string}
          />
          
          <Textarea 
            label="Executive Summary"
            placeholder="Briefly describe the project goals and context..."
            rows={4}
            {...register('description')}
            error={errors.description?.message as string}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted">
                <Layout className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Configuration</span>
              </div>
              <Select 
                label="Launch Status"
                options={[
                  { label: 'Active (Development)', value: 'active' },
                  { label: 'Completed (Archived)', value: 'completed' }
                ]}
                {...register('status')}
                error={errors.status?.message as string}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Timeline</span>
              </div>
              <Input 
                type="date"
                label="Target Deadline"
                {...register('deadline')}
                error={errors.deadline?.message as string}
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-border-default/50">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose} 
            disabled={isPending}
            className="md:w-auto w-full"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            loading={isPending}
            className="md:w-auto w-full shadow-sm"
          >
            {project ? 'Save Changes' : 'Initialize Project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
