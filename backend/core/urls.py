from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health(request):
    return JsonResponse({'data': {'status': 'ok'}, 'message': 'healthy', 'errors': None})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/tasks/', include('apps.tasks.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]
