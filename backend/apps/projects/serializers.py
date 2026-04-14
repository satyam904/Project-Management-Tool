from rest_framework import serializers
from django.utils import timezone
from .models import Project, ProjectMember
from apps.users.serializers import UserSerializer
from apps.users.models import User

class ProjectListSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'title', 'status', 'deadline', 'created_at', 'member_count', 'task_count']
        read_only_fields = fields

    def get_member_count(self, obj):
        return obj.members.count()

    def get_task_count(self, obj):
        return obj.tasks.filter(deleted_at__isnull=True).count()

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role', 'joined_at']
        read_only_fields = fields

class ProjectDetailSerializer(ProjectListSerializer):
    owner = UserSerializer(read_only=True)
    members = ProjectMemberSerializer(many=True, read_only=True)
    description = serializers.CharField()

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + ['description', 'owner', 'members']

class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['title', 'description', 'status', 'deadline']

    def validate_title(self, value):
        if len(value) < 3 or len(value) > 200:
            raise serializers.ValidationError("Title must be between 3 and 200 characters.")
        return value

    def validate_deadline(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value

class AddMemberSerializer(serializers.Serializer):
    user_email = serializers.EmailField()
    role = serializers.ChoiceField(choices=ProjectMember.ROLE_CHOICES)

    def validate_user_email(self, value):
        try:
            return User.objects.get(email=value.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email not found.")

    def validate(self, attrs):
        attrs['user'] = attrs.pop('user_email')
        return attrs
