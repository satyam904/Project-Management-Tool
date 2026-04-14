import React, { useEffect, useState } from 'react'
import { X, Calendar, Clock, User as UserIcon, Tag, MessageSquare, Send, Save } from 'lucide-react'
import { useTask, useUpdateTask, useComments, useAddComment } from './useTasks'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import type { TaskStatus, TaskPriority } from '../../types/task'
import type { ProjectMember } from '../../types/project'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/date'
import { clsx } from 'clsx'

interface TaskDetailPanelProps {
  taskId: string | null
  projectId: string
  members: ProjectMember[]
  onClose: () => void
}

export function TaskDetailPanel({ taskId, projectId, members, onClose }: TaskDetailPanelProps) {
  const { data: task, isLoading: isTaskLoading } = useTask(taskId || '')
  const { data: commentsResponse, isLoading: isCommentsLoading } = useComments(taskId || '')
  
  const updateMut = useUpdateTask(projectId)
  const addCommentMut = useAddComment(taskId || '')

  const comments = commentsResponse?.results || []

  // Local state for edits
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [description, setDescription] = useState('')

  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '')
      setAssignedTo(task.assigned_to?.id || '')
      setDescription(task.description || '')
    }
  }, [task])

  if (!taskId) return null

  const handleSave = () => {
    if (!task) return
    updateMut.mutate(
      {
        id: task.id,
        title,
        status,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        assigned_to: assignedTo || undefined,
        description
      },
      {
        onSuccess: () => {
          toast.success('Task details updated')
        },
        onError: () => {
          toast.error('Failed to update task')
        }
      }
    )
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addCommentMut.mutate(commentText, {
      onSuccess: () => {
        setCommentText('')
        toast.success('Comment added')
      },
      onError: () => toast.error('Failed to add comment')
    })
  }

  return (
    <>
      <div 
        className={clsx(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity',
          taskId ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />
      
      <div className={clsx(
        'fixed inset-y-0 right-0 w-full max-w-xl bg-background shadow-2xl z-[60] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-border-default',
        taskId ? 'translate-x-0' : 'translate-x-full'
      )}>
        {isTaskLoading ? (
          <div className="p-8 space-y-6 animate-pulse">
            <div className="h-4 w-20 bg-surface rounded" />
            <div className="h-10 bg-surface rounded w-3/4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-surface rounded" />
              <div className="h-16 bg-surface rounded" />
            </div>
            <div className="h-32 bg-surface rounded w-full" />
          </div>
        ) : task ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface/50 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-1.5 rounded-lg shadow-sm text-primary">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Task Details</h2>
                  <p className="text-[10px] font-medium text-text-muted/60">ID: {task.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-text-muted hover:text-text-h hover:bg-surface rounded-full p-2 transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-32 scroll-smooth">
              {/* Title Section */}
              <div className="space-y-3">
                <textarea
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full font-display text-2xl font-bold text-text-h bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-text-muted/20 leading-tight focus:outline-none"
                  placeholder="What needs to be done?"
                  rows={2}
                />
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant={status} className="px-2.5 py-0.5">{status.replace('-', ' ')}</Badge>
                  <Badge variant={priority} className="px-2.5 py-0.5">{priority} Priority</Badge>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-surface/30 p-5 rounded-xl border border-border-default/50">
                <div className="space-y-2">
                  <label className="flex items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider gap-1.5 ml-0.5">
                    <Clock className="w-3.5 h-3.5 text-primary/50" /> Status
                  </label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value as TaskStatus)}
                    className="w-full bg-background border border-border-default rounded-lg py-2 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all cursor-pointer font-medium text-text-h"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider gap-1.5 ml-0.5">
                    <Tag className="w-3.5 h-3.5 text-primary/50" /> Priority
                  </label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-background border border-border-default rounded-lg py-2 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all cursor-pointer font-medium text-text-h"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider gap-1.5 ml-0.5">
                    <Calendar className="w-3.5 h-3.5 text-primary/50" /> Due Date
                  </label>
                  <input 
                    type="datetime-local"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-background border border-border-default rounded-lg py-2 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all font-medium text-text-h"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center text-[11px] font-semibold text-text-muted uppercase tracking-wider gap-1.5 ml-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-primary/50" /> Assignee
                  </label>
                  <select 
                    value={assignedTo}
                    onChange={e => setAssignedTo(e.target.value)}
                    className="w-full bg-background border border-border-default rounded-lg py-2 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all cursor-pointer font-medium text-text-h"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.user.id}>
                        {m.user.first_name} {m.user.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider ml-0.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-surface border border-border-default rounded-xl p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all resize-none leading-relaxed placeholder:text-text-muted/30"
                  placeholder="Add more details about this task..."
                />
              </div>

              {/* Comments Section */}
              <div className="pt-8 border-t border-border-default space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h4 className="font-display font-bold text-text-h text-sm">Comments</h4>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface px-2 py-0.5 rounded-full border border-border-default">
                    {comments.length}
                  </span>
                </div>
                
                {isCommentsLoading ? (
                  <div className="space-y-4">
                    <div className="h-20 bg-surface rounded-xl animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.length === 0 ? (
                      <div className="py-10 px-6 bg-surface/20 border border-border-default border-dashed rounded-xl text-center">
                        <MessageSquare className="w-7 h-7 text-text-muted/20 mx-auto mb-2" />
                        <p className="text-sm text-text-muted">No comments yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-0 before:w-px before:bg-border-default/50">
                        {comments.map(comment => (
                          <div key={comment.id} className="relative flex gap-3 animate-fade-in">
                            <Avatar name={`${comment.user.first_name} ${comment.user.last_name}`} size="md" className="ring-4 ring-background z-10" />
                            <div className="flex-1 bg-surface ring-1 ring-border-default/50 rounded-xl p-4 shadow-sm hover:ring-primary/20 transition-all">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-text-h">
                                  {comment.user.first_name} {comment.user.last_name}
                                </span>
                                <span className="text-[10px] font-medium text-text-muted opacity-60">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4">
                  <form onSubmit={handleAddComment} className="flex gap-2 bg-surface border border-border-default rounded-xl p-2.5 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <input
                      type="text"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none px-2 py-1.5 text-sm focus:ring-0 focus:outline-none placeholder:text-text-muted/40"
                    />
                    <Button type="submit" disabled={!commentText.trim() || addCommentMut.isPending} size="sm" className="px-4">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-default bg-surface/80 backdrop-blur-md sticky bottom-0 z-20">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Unsaved Changes
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="px-4"
                >
                  Discard
                </Button>
                <Button 
                  onClick={handleSave} 
                  loading={updateMut.isPending}
                  className="px-6 gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4 animate-fade-in">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center border border-border-default">
              <Tag className="w-8 h-8 text-text-muted/20" />
            </div>
            <div className="space-y-1">
              <p className="text-text-h font-semibold">No task selected</p>
              <p className="text-text-muted text-sm max-w-xs mx-auto">Select a task from the board to view details.</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
