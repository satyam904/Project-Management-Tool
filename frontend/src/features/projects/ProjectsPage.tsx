import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderOpen, Calendar, CheckSquare, Trash2, Edit2 } from 'lucide-react'
import { useProjects, useDeleteProject } from './useProjects'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate, isOverdue } from '../../utils/date'
import { ProjectForm } from './ProjectForm'
import { Modal } from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import type { Project } from '../../types/project'
import { clsx } from 'clsx'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  
  const [formOpen, setFormOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
  
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const deleteMut = useDeleteProject()

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading } = useProjects({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  })

  const handleAddNew = () => {
    setProjectToEdit(null)
    setFormOpen(true)
  }

  const handleEdit = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation()
    setProjectToEdit(p)
    setFormOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, p: Project) => {
    e.stopPropagation()
    setProjectToDelete(p)
  }

  const confirmDelete = () => {
    if (!projectToDelete) return
    deleteMut.mutate(projectToDelete.id, {
      onSuccess: () => {
        toast.success('Project deleted')
        setProjectToDelete(null)
      },
      onError: () => toast.error('Failed to delete project')
    })
  }

  return (
    <PageWrapper 
      title="Projects" 
      actions={<Button onClick={handleAddNew} className="shadow-premium">New Project</Button>}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            className="!pl-10 shadow-sm" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex bg-surface border border-border-default rounded-premium p-1.5 space-x-1.5 overflow-x-auto shrink-0 shadow-sm">
          {[
            { label: 'All Projects', value: '' },
            { label: 'Active', value: 'active' },
            { label: 'Completed', value: 'completed' }
          ].map(tab => {
            const isActive = statusFilter === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={clsx(
                  'px-4 py-1.5 text-xs font-semibold rounded-premium-sm transition-all duration-200 whitespace-nowrap',
                  isActive 
                    ? 'bg-background text-primary shadow-sm border border-border-default/50' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-h'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-premium-lg border border-border-default" />
          ))}
        </div>
      ) : data?.results && data.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
          {data.results.map(project => (
            <Card 
              key={project.id} 
              className="group flex flex-col justify-between h-full p-8 shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-display text-lg font-bold text-text-h line-clamp-2 leading-tight group-hover:text-primary transition-colors min-w-0" title={project.title}>
                    {project.title}
                  </h3>
                  <Badge variant={project.status} className="shrink-0 mt-0.5">
                    {project.status === 'active' ? 'Active' : 'Completed'}
                  </Badge>
                </div>
                {project.description && (
                  <p className="text-sm text-text-muted mt-1 line-clamp-2 leading-relaxed min-w-0">{project.description}</p>
                )}
              </div>
              
              <div className="mt-6 pt-5 border-t border-border-default/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className="flex items-center text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
                      <span className={clsx(
                        isOverdue(project.deadline) && project.status !== 'completed' ? 'text-red-500' : 'text-text-muted'
                      )}>
                        {project.deadline ? formatDate(project.deadline) : 'Flexible'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs font-medium text-text-muted">
                      <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                      <span>{project.task_count} tasks</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <button 
                      onClick={(e) => handleEdit(e, project)}
                      className="p-1.5 text-text-muted hover:text-primary hover:bg-primary-bg rounded-premium-sm mr-1 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, project)}
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-premium-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-surface/50 border border-border-default border-dashed rounded-premium-lg min-h-[400px]">
          <div className="bg-background p-4 rounded-full shadow-sm mb-6">
            <FolderOpen className="w-12 h-12 text-primary/40" />
          </div>
          <h3 className="font-display text-xl font-bold text-text-h">No projects found</h3>
          <p className="text-sm text-text-muted mt-2 mb-8 text-center max-w-xs">Start your productivity journey by creating your first project today.</p>
          <Button onClick={handleAddNew} size="lg" className="shadow-premium">New Project</Button>
        </div>
      )}

      <ProjectForm 
        open={formOpen} 
        onClose={() => setFormOpen(false)} 
        project={projectToEdit}
      />

      <Modal open={!!projectToDelete} onClose={() => !deleteMut.isPending && setProjectToDelete(null)} title="Delete Project">
        <p className="text-text-muted mb-8 leading-relaxed">This will permanently delete the project and all its tasks. This action cannot be reversed.</p>
        <div className="flex justify-end space-x-3">
          <Button onClick={() => setProjectToDelete(null)} variant="outline" disabled={deleteMut.isPending}>Cancel</Button>
          <Button onClick={confirmDelete} variant="destructive" loading={deleteMut.isPending}>Delete Project</Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
