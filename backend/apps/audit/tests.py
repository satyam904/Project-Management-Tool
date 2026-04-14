from rest_framework.test import APITestCase
from apps.users.models import User
from .models import AuditLog

class AuditLogTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(email='admin@example.com', password='Password@1', first_name='A', last_name='1')
        self.user = User.objects.create_user(email='user@example.com', password='Password@1', first_name='U', last_name='1')
        
        self.log = AuditLog.objects.create(
            user=self.user,
            action='CREATE',
            entity_type='Project',
            entity_id='12345678-1234-5678-1234-567812345678',
            new_values={'title': 'P1'}
        )
        self.list_url = '/api/v1/audit/'
        self.detail_url = f'/api/v1/audit/{self.log.id}/'

    def test_list_logs_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 200)
        data = res.data['data']['results'] if 'results' in res.data['data'] else res.data['data']
        self.assertEqual(len(data), 1)

    def test_list_logs_as_user(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 403)

    def test_list_logs_unauthenticated(self):
        res = self.client.get(self.list_url)
        self.assertEqual(res.status_code, 401)

    def test_retrieve_log_as_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['data']['action'], 'CREATE')

    def test_retrieve_log_as_user(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.detail_url)
        self.assertEqual(res.status_code, 403)

    def test_create_log_not_allowed(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(self.list_url, {})
        self.assertEqual(res.status_code, 405) # Viewset is ReadOnlyModelViewSet

    def test_update_log_not_allowed(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.patch(self.detail_url, {})
        self.assertEqual(res.status_code, 405)

    def test_delete_log_not_allowed(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.delete(self.detail_url)
        self.assertEqual(res.status_code, 405)
