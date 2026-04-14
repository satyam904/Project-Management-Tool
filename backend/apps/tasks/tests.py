from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from apps.users.models import User
from apps.projects.models import Project, ProjectMember
from .models import Task, TaskComment

class TaskTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='Password@1', first_name='U', last_name='1')
        self.user2 = User.objects.create_user(email='user2@example.com', password='Password@1', first_name='U', last_name='2')
        self.user3 = User.objects.create_user(email='user3@example.com', password='Password@1', first_name='U', last_name='3')
        
        self.project = Project.objects.create(owner=self.user1, title='P1', status='active')
        ProjectMember.objects.create(project=self.project, user=self.user2, role='editor')
        
        self.task = Task.objects.create(
            project=self.project,
            created_by=self.user1,
            title='T1',
            status='todo',
            priority='high'
        )
        
        self.list_url = '/api/v1/tasks/'
        self.detail_url = f'/api/v1/tasks/{self.task.id}/'
        
    def test_list_tasks_returns_member_tasks(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 200)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'T1')

    def test_list_excludes_non_member_tasks(self):
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 200)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 0)

    def test_create_task(self):
        self.client.force_authenticate(user=self.user2)
        data = {
            'project': str(self.project.id),
            'title': 'New T',
            'status': 'todo',
            'priority': 'medium'
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Task.objects.count(), 2)

    def test_create_task_as_non_member(self):
        self.client.force_authenticate(user=self.user3)
        data = {
            'project': str(self.project.id),
            'title': 'New T',
            'status': 'todo',
            'priority': 'medium'
        }
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, 403) # permission denied raised by perform_create!

    def test_create_missing_title(self):
        self.client.force_authenticate(user=self.user1)
        data = {'project': str(self.project.id)}
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, 400)

    def test_retrieve_task_as_member(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['data']['title'], 'T1')

    def test_retrieve_task_as_non_member(self):
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 404)

    def test_update_task_as_member(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.patch(self.detail_url, {'title': 'Updated'})
        self.assertEqual(res.status_code, 200)
        self.task.refresh_from_db()
        self.assertEqual(self.task.title, 'Updated')

    def test_delete_task_soft(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, 204)
        self.task.refresh_from_db()
        self.assertIsNotNone(self.task.deleted_at)

    def test_deleted_task_not_in_list(self):
        self.task.soft_delete()
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(self.list_url)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 0)

    def test_add_comment(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.post(f'{self.detail_url}comments/', {'content': 'Hello!'})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(TaskComment.objects.count(), 1)
        self.assertEqual(TaskComment.objects.first().content, 'Hello!')

    def test_add_comment_as_non_member(self):
        self.client.force_authenticate(user=self.user3)
        res = self.client.post(f'{self.detail_url}comments/', {'content': 'Hello!'})
        self.assertEqual(res.status_code, 404)

    def test_remove_comment(self):
        comment = TaskComment.objects.create(task=self.task, user=self.user2, content='Del')
        self.client.force_authenticate(user=self.user2)
        res = self.client.delete(f'{self.detail_url}comments/{comment.id}/')
        self.assertEqual(res.status_code, 204)
        self.assertEqual(TaskComment.objects.count(), 0)

    def test_remove_comment_as_owner(self):
        comment = TaskComment.objects.create(task=self.task, user=self.user2, content='Del')
        self.client.force_authenticate(user=self.user1)
        res = self.client.delete(f'{self.detail_url}comments/{comment.id}/')
        self.assertEqual(res.status_code, 204)

    def test_remove_comment_as_unauthorized(self):
        comment = TaskComment.objects.create(task=self.task, user=self.user1, content='Del')
        self.client.force_authenticate(user=self.user2)
        res = self.client.delete(f'{self.detail_url}comments/{comment.id}/')
        self.assertEqual(res.status_code, 403)
