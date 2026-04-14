from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Allows access only if request.user is the object's owner field."""

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user
