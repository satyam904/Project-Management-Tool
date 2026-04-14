from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.ProjectViewSet, basename='project')

urlpatterns = [
    path('<uuid:project_pk>/members/', views.ProjectMemberViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('<uuid:project_pk>/members/<uuid:pk>/', views.ProjectMemberViewSet.as_view({'patch': 'partial_update', 'delete': 'destroy'})),
] + router.urls
