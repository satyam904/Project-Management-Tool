import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Task
        fields = ['project', 'status', 'priority', 'assigned_to']

    def filter_search(self, queryset, name, value):
        return queryset.filter(title__icontains=value) | queryset.filter(description__icontains=value)
