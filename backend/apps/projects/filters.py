import django_filters
from .models import Project

class ProjectFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')

    class Meta:
        model = Project
        fields = ['status']

    def filter_search(self, queryset, name, value):
        # search title and description together
        return queryset.filter(title__icontains=value) | queryset.filter(description__icontains=value)
