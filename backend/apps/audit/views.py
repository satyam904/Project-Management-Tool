from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

from .models import AuditLog
from .serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['action', 'entity_type', 'user']
    ordering_fields = ['created_at']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None})

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({'data': response.data, 'message': 'success', 'errors': None})
