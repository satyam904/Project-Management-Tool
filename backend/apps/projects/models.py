import uuid
from django.db import models
from django.conf import settings
from common.mixins import SoftDeleteMixin


class Project(SoftDeleteMixin, models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_COMPLETED = 'completed'
    STATUS_CHOICES = [(STATUS_ACTIVE, 'Active'), (STATUS_COMPLETED, 'Completed')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, default=None)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner'], name='idx_projects_owner_id'),
            models.Index(fields=['status'], name='idx_projects_status'),
            models.Index(fields=['deleted_at'], name='idx_projects_deleted_at'),
        ]

    def __str__(self):
        return self.title


class ProjectMember(models.Model):
    ROLE_OWNER = 'owner'
    ROLE_EDITOR = 'editor'
    ROLE_VIEWER = 'viewer'
    ROLE_CHOICES = [(ROLE_OWNER, 'Owner'), (ROLE_EDITOR, 'Editor'), (ROLE_VIEWER, 'Viewer')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_VIEWER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project_members'
        unique_together = [('project', 'user')]
        indexes = [
            models.Index(fields=['project', 'user'], name='idx_project_members_unique'),
        ]

    def __str__(self):
        return f'{self.user.email} in {self.project.title} as {self.role}'
