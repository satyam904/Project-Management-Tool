import uuid
from django.db import models
from django.conf import settings
from common.mixins import SoftDeleteMixin


class Task(SoftDeleteMixin, models.Model):
    STATUS_TODO = 'todo'
    STATUS_IN_PROGRESS = 'in-progress'
    STATUS_DONE = 'done'
    STATUS_CHOICES = [
        (STATUS_TODO, 'Todo'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_DONE, 'Done'),
    ]

    PRIORITY_LOW = 'low'
    PRIORITY_MEDIUM = 'medium'
    PRIORITY_HIGH = 'high'
    PRIORITY_CHOICES = [(PRIORITY_LOW, 'Low'), (PRIORITY_MEDIUM, 'Medium'), (PRIORITY_HIGH, 'High')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default=PRIORITY_MEDIUM)
    due_date = models.DateTimeField(null=True, blank=True)
    order_index = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, default=None)

    class Meta:
        db_table = 'tasks'
        ordering = ['order_index', 'created_at']
        indexes = [
            models.Index(fields=['project'], name='idx_tasks_project_id'),
            models.Index(fields=['assigned_to'], name='idx_tasks_assigned_to'),
            models.Index(fields=['status'], name='idx_tasks_status'),
            models.Index(fields=['deleted_at'], name='idx_tasks_deleted_at'),
        ]

    def __str__(self):
        return self.title


class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'task_comments'
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment by {self.user.email} on {self.task.title}'
