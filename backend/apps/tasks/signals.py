from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.tasks.models import Task
from apps.projects.models import Project

@receiver(post_save, sender=Task)
def update_project_status(sender, instance, **kwargs):
    """
    Automatically set project status to 'completed' if all active tasks are 'done'.
    Reverts to 'active' if any task is not 'done'.
    """
    project = instance.project
    
    # Get all non-deleted tasks for this project
    active_tasks = project.tasks.filter(deleted_at__isnull=True)
    
    # If there are no tasks, keep as is or set to Active
    if not active_tasks.exists():
        return

    # Check if all tasks are 'done'
    all_done = active_tasks.exclude(status=Task.STATUS_DONE).count() == 0
    
    if all_done:
        new_status = Project.STATUS_COMPLETED
    else:
        new_status = Project.STATUS_ACTIVE
        
    # Only save if status actually changed to avoid infinite recursions or redundant writes
    if project.status != new_status:
        project.status = new_status
        project.save(update_fields=['status'])
