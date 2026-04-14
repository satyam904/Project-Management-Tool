from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
import django.db.models as models

from .models import Task, TaskComment
from .serializers import (
    TaskListSerializer, TaskDetailSerializer, TaskWriteSerializer, TaskCommentSerializer,
    TaskReorderSerializer
)
from rest_framework.permissions import IsAuthenticated
from .permissions import CanAccessTask
from .filters import TaskFilter

class TaskViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = TaskFilter
    ordering_fields = ['created_at', 'title', 'due_date', 'order_index', 'priority']
    permission_classes = [IsAuthenticated, CanAccessTask]


    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Task.objects.none()
            
        return Task.objects.filter(
            deleted_at__isnull=True
        ).filter(
            models.Q(project__owner=user) | models.Q(project__members__user=user)
        ).distinct().select_related('project', 'assigned_to', 'created_by').prefetch_related('comments', 'comments__user')


    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        elif self.action == 'retrieve':
            return TaskDetailSerializer
        elif self.action == 'reorder':
            return TaskReorderSerializer
        return TaskWriteSerializer

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        if project.owner != self.request.user and not project.members.filter(user=self.request.user).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a member of this project.")
        serializer.save(created_by=self.request.user)
        
    def perform_update(self, serializer):
        project = serializer.validated_data.get('project', serializer.instance.project)
        if project.owner != self.request.user and not project.members.filter(user=self.request.user).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You are not a member of this project.")
        serializer.save()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None})

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None})

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None})

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post'], url_path='comments')
    def comments(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            queryset = task.comments.all().select_related('user')
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = TaskCommentSerializer(page, many=True)
                # Ensure it follows the ApiResponse structure
                return Response({
                    'data': self.get_paginated_response(serializer.data).data,
                    'message': 'success',
                    'errors': None
                })

            
            serializer = TaskCommentSerializer(queryset, many=True)
            return Response({'data': serializer.data, 'message': 'success', 'errors': None})

        # POST logic (add_comment)
        serializer = TaskCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(task=task, user=request.user)
        return Response({
            'data': TaskCommentSerializer(comment).data,
            'message': 'success',
            'errors': None
        }, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['delete'], url_path=r'comments/(?P<comment_id>[^/.]+)')
    def remove_comment(self, request, pk=None, comment_id=None):
        task = self.get_object()
        comment = get_object_or_404(TaskComment, pk=comment_id, task=task)
        if comment.user != request.user and task.project.owner != request.user:
            return Response({'data': None, 'message': 'error', 'errors': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'], url_path='reorder')
    def reorder(self, request, pk=None):
        task = self.get_object()
        serializer = TaskReorderSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'data': TaskDetailSerializer(task).data,
            'message': 'success',
            'errors': None
        })
