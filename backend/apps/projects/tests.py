from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from .models import Project, ProjectMember

class ProjectTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='Password@1', first_name='U', last_name='1')
        self.user2 = User.objects.create_user(email='user2@example.com', password='Password@1', first_name='U', last_name='2')
        self.user3 = User.objects.create_user(email='user3@example.com', password='Password@1', first_name='U', last_name='3')
        
        self.project = Project.objects.create(owner=self.user1, title='P1', status='active')
        ProjectMember.objects.create(project=self.project, user=self.user1, role='owner')
        ProjectMember.objects.create(project=self.project, user=self.user2, role='viewer')
        
        self.list_url = '/api/v1/projects/'
        self.detail_url = f'/api/v1/projects/{self.project.id}/'
        self.members_url = f'/api/v1/projects/{self.project.id}/members/'
        
    def test_list_projects_returns_own(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 200)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'P1')

    def test_list_projects_returns_member(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 200)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 1)

    def test_list_excludes_other_users_projects(self):
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 200)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 0)

    def test_create_project(self):
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'New P', 'status': 'active'}
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Project.objects.count(), 2)

    def test_create_missing_title(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.post(self.list_url, {})
        self.assertEqual(res.status_code, 400)

    def test_create_past_deadline(self):
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'T', 'deadline': (timezone.now() - timedelta(days=1)).isoformat()}
        res = self.client.post(self.list_url, data)
        self.assertEqual(res.status_code, 400)

    def test_retrieve_project_as_owner(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 200)

    def test_retrieve_project_as_member(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 200)

    def test_retrieve_project_as_non_member(self):
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 404)

    def test_update_project_as_owner(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.patch(self.detail_url, {'title': 'Updated'})
        self.assertEqual(res.status_code, 200)

    def test_update_project_as_editor(self):
        ProjectMember.objects.filter(project=self.project, user=self.user2).update(role='editor')
        self.client.force_authenticate(user=self.user2)
        res = self.client.patch(self.detail_url, {'title': 'Updated'})
        self.assertEqual(res.status_code, 200)

    def test_update_project_as_viewer(self):
        self.client.force_authenticate(user=self.user2)
        res = self.client.patch(self.detail_url, {'title': 'Updated'})
        self.assertEqual(res.status_code, 403)

    def test_delete_project_soft(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, 204)
        self.project.refresh_from_db()
        self.assertIsNotNone(self.project.deleted_at)

    def test_deleted_project_not_in_list(self):
        self.project.soft_delete()
        self.client.force_authenticate(user=self.user1)
        res = self.client.get(self.list_url)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 0)

    # Member tests
    def test_add_member(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.post(self.members_url, {'user_email': 'user3@example.com', 'role': 'viewer'})
        self.assertEqual(res.status_code, 201)

    def test_add_nonexistent_email(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.post(self.members_url, {'user_email': 'unknown@example.com', 'role': 'viewer'})
        self.assertEqual(res.status_code, 400)

    def test_add_duplicate_member(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.post(self.members_url, {'user_email': 'user2@example.com', 'role': 'viewer'})
        self.assertEqual(res.status_code, 400)

    def test_change_member_role(self):
        self.client.force_authenticate(user=self.user1)
        member = self.project.members.get(user=self.user2)
        res = self.client.patch(f'{self.members_url}{member.id}/', {'role': 'editor'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['data']['role'], 'editor')

    def test_remove_member(self):
        self.client.force_authenticate(user=self.user1)
        member = self.project.members.get(user=self.user2)
        res = self.client.delete(f'{self.members_url}{member.id}/')
        self.assertEqual(res.status_code, 204)
        self.assertFalse(self.project.members.filter(user=self.user2).exists())

    def test_non_owner_cannot_remove_member(self):
        self.client.force_authenticate(user=self.user2)
        member = self.project.members.get(user=self.user1)
        res = self.client.delete(f'{self.members_url}{member.id}/')
        self.assertEqual(res.status_code, 403)
