import uuid
from django.db import models
from django.conf import settings


class AuditLog(models.Model):
    ACTION_CREATE = 'CREATE'
    ACTION_UPDATE = 'UPDATE'
    ACTION_DELETE = 'DELETE'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=20)
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField()
    old_values = models.JSONField(null=True, blank=True)
    new_values = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user'], name='idx_audit_logs_user_id'),
            models.Index(fields=['entity_type', 'entity_id'], name='idx_audit_logs_entity'),
        ]

    def __str__(self):
        return f'{self.action} {self.entity_type} {self.entity_id}'
