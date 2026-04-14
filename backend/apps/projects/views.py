from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
import django.db.models as models

from .models import Project, ProjectMember
from .serializers import (
    ProjectListSerializer, ProjectDetailSerializer, ProjectWriteSerializer,
    ProjectMemberSerializer, AddMemberSerializer
)
from .permissions import IsProjectMember, IsProjectOwner, IsProjectOwnerOrEditor
from .filters import ProjectFilter

class ProjectViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ProjectFilter
    ordering_fields = ['created_at', 'title', 'deadline']
    
    def get_permissions(self):

        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated(), IsProjectOwnerOrEditor()]
        if self.action == 'destroy':
            return [IsAuthenticated(), IsProjectOwner()]
        return [IsAuthenticated(), IsProjectMember()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Project.objects.none()
            
        return Project.objects.filter(
            deleted_at__isnull=True
        ).filter(
            models.Q(owner=user) | models.Q(members__user=user)
        ).distinct().select_related('owner').prefetch_related('members', 'tasks')

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectWriteSerializer

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMember.objects.create(project=project, user=self.request.user, role=ProjectMember.ROLE_OWNER)

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

class ProjectMemberViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_project(self):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'], deleted_at__isnull=True)
        is_owner = project.owner == self.request.user
        is_member = project.members.filter(user=self.request.user).exists()
        if not (is_owner or is_member):
            from django.http import Http404
            raise Http404()
        return project

    def list(self, request, project_pk=None):
        project = self.get_project()
        members = project.members.select_related('user')
        serializer = ProjectMemberSerializer(members, many=True)
        return Response({'data': serializer.data, 'message': 'success', 'errors': None})

    def create(self, request, project_pk=None):
        project = self.get_project()
        if project.owner != request.user:
            return Response({'data': None, 'message': 'error', 'errors': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_to_add = serializer.validated_data['user']
        role = serializer.validated_data['role']
        
        if project.members.filter(user=user_to_add).exists():
            return Response({'data': None, 'message': 'error', 'errors': {'user_email': ['User is already a member']}}, status=status.HTTP_400_BAD_REQUEST)
        
        member = ProjectMember.objects.create(project=project, user=user_to_add, role=role)
        return Response({'data': ProjectMemberSerializer(member).data, 'message': 'success', 'errors': None}, status=status.HTTP_201_CREATED)

    def partial_update(self, request, project_pk=None, pk=None):
        project = self.get_project()
        if project.owner != request.user:
            return Response({'data': None, 'message': 'error', 'errors': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        member = get_object_or_404(ProjectMember, pk=pk, project=project)
        role = request.data.get('role')
        if not role or role not in dict(ProjectMember.ROLE_CHOICES):
            return Response({'data': None, 'message': 'error', 'errors': {'role': ['Invalid role']}}, status=status.HTTP_400_BAD_REQUEST)
            
        if member.user == request.user and member.role == ProjectMember.ROLE_OWNER and role != ProjectMember.ROLE_OWNER:
            owner_count = project.members.filter(role=ProjectMember.ROLE_OWNER).count()
            if owner_count <= 1:
                return Response({'data': None, 'message': 'error', 'errors': {'role': ['Cannot demote the only owner']}}, status=status.HTTP_400_BAD_REQUEST)
        
        member.role = role
        member.save()
        return Response({'data': ProjectMemberSerializer(member).data, 'message': 'success', 'errors': None})

    def destroy(self, request, project_pk=None, pk=None):
        project = self.get_project()
        if project.owner != request.user:
            return Response({'data': None, 'message': 'error', 'errors': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            
        member = get_object_or_404(ProjectMember, pk=pk, project=project)
        
        if member.user == request.user and member.role == ProjectMember.ROLE_OWNER:
            owner_count = project.members.filter(role=ProjectMember.ROLE_OWNER).count()
            if owner_count <= 1:
                return Response({'data': None, 'message': 'error', 'errors': {'detail': ['Cannot remove the only owner']}}, status=status.HTTP_400_BAD_REQUEST)
                
        member.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
