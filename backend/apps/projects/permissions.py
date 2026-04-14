from rest_framework.permissions import BasePermission
from .models import ProjectMember

class IsProjectMember(BasePermission):
    """User must be a member or owner of the project."""

    def has_object_permission(self, request, view, obj):
        return (
            obj.owner == request.user
            or obj.members.filter(user=request.user).exists()
        )

class IsProjectOwner(BasePermission):
    """Only the project owner can perform this action."""

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class IsProjectOwnerOrEditor(BasePermission):
    """Owner or editor role can modify the project."""

    def has_object_permission(self, request, view, obj):
        if obj.owner == request.user:
            return True
        return obj.members.filter(user=request.user, role__in=['owner', 'editor']).exists()
