import { useProjects } from '../projects/useProjects'
import { useTasks } from '../tasks/useTasks'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects()
  // Fetching a broad set of tasks (not project specific) - we'll pass an empty string if permitted by API or all tasks if backend allows
  const { data: tasksData, isLoading: isTasksLoading } = useTasks('', {})

  const stats = [
    { 
      label: 'Active Projects', 
      value: projectsData?.count || 0, 
      icon: FolderKanban, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      label: 'Total Tasks', 
      value: tasksData?.count || 0, 
      icon: CheckSquare, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
    { 
      label: 'Due Soon', 
      value: tasksData?.results?.filter(t => t.status !== 'done').length || 0, 
      icon: Clock, 
      color: 'text-warning',
      bg: 'bg-warning/10'
    },
    { 
      label: 'Urgent', 
      value: tasksData?.results?.filter(t => t.priority === 'high').length || 0, 
      icon: AlertCircle, 
      color: 'text-error',
      bg: 'bg-error/10'
    }
  ]

  return (
    <PageWrapper title="Dashboard">
      <div className="space-y-16 lg:space-y-24">
        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-text-h tracking-tight">
            Welcome back, {user?.first_name || 'User'}!
          </h2>
          <p className="text-text-muted mt-2 text-lg">Here's what's happening across your workspace today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className="flex flex-col gap-6 p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`${stat.bg} p-3 rounded-premium`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-success opacity-50" />
              </div>
              <div>
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-display font-bold text-text-h mt-2">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Recent Projects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-display font-bold text-text-h flex items-center gap-3">
                <FolderKanban className="w-6 h-6 text-primary" /> Recent Projects
              </h3>
              <Link to="/projects" className="text-sm font-bold text-primary hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {isProjectsLoading ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-premium" />)
              ) : projectsData?.results?.slice(0, 3).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`}>
                  <Card className="p-6 hover:border-primary/50 transition-colors flex items-center justify-between group">
                    <div>
                      <h4 className="text-lg font-bold text-text-h group-hover:text-primary transition-colors">{p.title}</h4>
                      <p className="text-sm text-text-muted mt-1.5">{p.task_count} tasks • {p.status}</p>
                    </div>
                    <Badge variant={p.status} className="px-4 py-1">{p.status}</Badge>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-display font-bold text-text-h flex items-center gap-3">
                <CheckSquare className="w-6 h-6 text-success" /> Recent Tasks
              </h3>
              <Link to="/tasks" className="text-sm font-bold text-primary hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
              {isTasksLoading ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-premium" />)
              ) : tasksData?.results?.slice(0, 3).map(t => (
                <Card key={t.id} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className={clsx(
                      'w-2.5 h-2.5 rounded-full shadow-sm',
                      t.priority === 'high' ? 'bg-error' : t.priority === 'medium' ? 'bg-warning' : 'bg-primary'
                    )} />
                    <div>
                      <h4 className="text-lg font-bold text-text-h">{t.title}</h4>
                      <p className="text-sm text-text-muted mt-1.5">{t.status.replace('-', ' ')} • {t.priority} priority</p>
                    </div>
                  </div>
                  <Badge variant={t.priority} className="px-4 py-1">{t.priority}</Badge>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

function clsx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
