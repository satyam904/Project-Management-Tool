from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
import json
from apps.projects.models import Project
from apps.tasks.models import Task
from .models import AuditLog
from common.middleware import get_current_user

def _log(action, entity_type, entity_id, user=None, old=None, new=None):
    # Resolve the user from the thread-local middleware
    resolved_user = user or get_current_user()

    # Guard: skip audit log if user is anonymous or unavailable
    if resolved_user is None or not getattr(resolved_user, 'is_authenticated', False):
        return

    # Ensure old/new values are JSON serializable (handles UUIDs, datetimes)
    if old:
        old = json.loads(json.dumps(old, cls=DjangoJSONEncoder))
    if new:
        new = json.loads(json.dumps(new, cls=DjangoJSONEncoder))
        
    AuditLog.objects.create(
        user=resolved_user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        old_values=old,
        new_values=new,
    )


@receiver(post_save, sender=Project)
def log_project_save(sender, instance, created, **kwargs):
    action = AuditLog.ACTION_CREATE if created else AuditLog.ACTION_UPDATE
    # Simplification: we're not tracking old values effectively here without more complexity
    # but we can at least log the current state as new_values
    new_values = model_to_dict(instance)
    _log(action, 'project', instance.id, new=new_values)

@receiver(post_delete, sender=Project)
def log_project_delete(sender, instance, **kwargs):
    _log(AuditLog.ACTION_DELETE, 'project', instance.id, old=model_to_dict(instance))

@receiver(post_save, sender=Task)
def log_task_save(sender, instance, created, **kwargs):
    action = AuditLog.ACTION_CREATE if created else AuditLog.ACTION_UPDATE
    new_values = model_to_dict(instance)
    _log(action, 'task', instance.id, new=new_values)

@receiver(post_delete, sender=Task)
def log_task_delete(sender, instance, **kwargs):
    _log(AuditLog.ACTION_DELETE, 'task', instance.id, old=model_to_dict(instance))
