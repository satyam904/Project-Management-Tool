from rest_framework import serializers
from .models import Task, TaskComment
from apps.users.serializers import UserSerializer

class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class TaskListSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'status', 'priority', 'assigned_to', 'due_date', 'comment_count', 'order_index', 'created_at']

    def get_comment_count(self, obj):
        return obj.comments.count()

class TaskDetailSerializer(TaskListSerializer):
    created_by = UserSerializer(read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    description = serializers.CharField()

    class Meta(TaskListSerializer.Meta):
        fields = TaskListSerializer.Meta.fields + ['description', 'created_by', 'comments']

class TaskWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['project', 'title', 'description', 'status', 'priority', 'assigned_to', 'due_date', 'order_index']

    def validate_title(self, value):
        if len(value) < 3 or len(value) > 200:
            raise serializers.ValidationError("Title must be between 3 and 200 characters.")
        return value

class TaskReorderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['order_index']
