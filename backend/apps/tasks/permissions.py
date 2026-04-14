from rest_framework.permissions import BasePermission

class CanAccessTask(BasePermission):
    """User must be a member of the project the task belongs to."""
    def has_object_permission(self, request, view, obj):
        return obj.project.owner == request.user or obj.project.members.filter(user=request.user).exists()
