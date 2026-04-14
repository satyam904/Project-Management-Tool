import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Calendar, Users, CheckSquare, ArrowLeft, Trash2, Edit } from 'lucide-react'
import { useProject, useDeleteProject } from './useProjects'
import { ProjectForm } from './ProjectForm'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { TaskList } from '../tasks/TaskList'
import { formatDate } from '../../utils/date'
import toast from 'react-hot-toast'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id!)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const deleteMut = useDeleteProject()

  if (isLoading) {
    return (
      <PageWrapper title="Project Details">
        <div className="flex flex-col gap-4 animate-pulse">
          <Skeleton className="h-4 w-32" />
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-1/2">
              <Skeleton className="h-8 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!project) {
    return (
      <PageWrapper title="Project Not Found">
        <div className="flex flex-col items-center justify-center p-16 bg-surface/30 rounded-xl border border-border-default border-dashed">
          <h2 className="text-lg font-bold text-text-h">Project not found</h2>
          <p className="text-sm text-text-muted mt-1.5">The project you are looking for might have been deleted.</p>
          <Button className="mt-5" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </PageWrapper>
    )
  }

  const handleDelete = () => {
    deleteMut.mutate(project.id, {
      onSuccess: () => {
        toast.success('Project deleted successfully')
        navigate('/dashboard')
      }
    })
  }

  return (
    <PageWrapper title={project.title}>
      <div className="flex flex-col h-full">
        <Link 
          to="/projects" 
          className="group flex items-center text-sm font-medium text-text-muted hover:text-primary transition-all mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </Link>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-border-default mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <h1 className="font-display text-2xl font-bold text-text-h tracking-tight">{project.title}</h1>
              <Badge variant={project.status}>{project.status === 'active' ? 'Active' : 'Completed'}</Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-5 text-sm text-text-muted">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary/50" />
                <span>{project.deadline ? formatDate(project.deadline) : 'Flexible Timeline'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary/50" />
                <span>{project.members?.length || 0} Members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-primary/50" />
                <span>{project.task_count} Tasks</span>
              </div>
            </div>
            
            {project.description && (
              <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" onClick={() => setFormOpen(true)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteModalOpen(true)} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-hidden">
          <TaskList projectId={project.id} members={project.members || []} />
        </div>
      </div>

      <ProjectForm open={formOpen} onClose={() => setFormOpen(false)} project={project} />
      
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Delete Project">
        <div className="py-2">
          <p className="text-sm text-text-muted leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-text-h">"{project.title}"</span>? 
            This will permanently remove the project and all its tasks.
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
           <Button variant="ghost" onClick={() => setDeleteModalOpen(false)} disabled={deleteMut.isPending}>Cancel</Button>
           <Button variant="destructive" onClick={handleDelete} loading={deleteMut.isPending}>Confirm Delete</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
