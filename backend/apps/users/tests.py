from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='Test@1234',
            first_name='Test',
            last_name='User'
        )
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.logout_url = '/api/v1/auth/logout/'
        self.me_url = '/api/v1/auth/me/'

    # Register tests
    def test_register_success(self):
        data = {
            'email': 'new@example.com',
            'password': 'Password@1',
            'first_name': 'New',
            'last_name': 'User'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data['data'])
        self.assertIn('refresh', res.data['data'])
        self.assertEqual(res.data['data']['user']['email'], 'new@example.com')

    def test_register_duplicate_email(self):
        data = {
            'email': 'test@example.com',
            'password': 'Password@1',
            'first_name': 'New',
            'last_name': 'User'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data['errors'])

    def test_register_weak_password_no_uppercase(self):
        data = {
            'email': 'new@example.com',
            'password': 'password1',
            'first_name': 'New',
            'last_name': 'User'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', res.data['errors'])

    def test_register_weak_password_no_digit(self):
        data = {
            'email': 'new@example.com',
            'password': 'Password',
            'first_name': 'New',
            'last_name': 'User'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', res.data['errors'])

    def test_register_weak_password_too_short(self):
        data = {
            'email': 'new@example.com',
            'password': 'Ab1',
            'first_name': 'New',
            'last_name': 'User'
        }
        res = self.client.post(self.register_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', res.data['errors'])

    def test_register_missing_fields(self):
        res = self.client.post(self.register_url, {})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # Login tests
    def test_login_success(self):
        data = {'email': 'test@example.com', 'password': 'Test@1234'}
        res = self.client.post(self.login_url, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data['data'])
        self.assertIn('refresh', res.data['data'])

    def test_login_wrong_password(self):
        data = {'email': 'test@example.com', 'password': 'WrongPassword1'}
        res = self.client.post(self.login_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_nonexistent_email(self):
        data = {'email': 'unknown@example.com', 'password': 'Test@1234'}
        res = self.client.post(self.login_url, data)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_case_insensitive_email(self):
        data = {'email': 'TEST@EXAMPLE.COM', 'password': 'Test@1234'}
        res = self.client.post(self.login_url, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    # Me tests
    def test_me_authenticated(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['email'], self.user.email)

    def test_me_unauthenticated(self):
        res = self.client.get(self.me_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_update(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.patch(self.me_url, {'first_name': 'Updated'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['data']['first_name'], 'Updated')
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    # Logout tests
    def test_logout_success(self):
        # login first
        login_res = self.client.post(self.login_url, {'email': 'test@example.com', 'password': 'Test@1234'})
        refresh = login_res.data['data']['refresh']
        self.client.force_authenticate(user=self.user)
        res = self.client.post(self.logout_url, {'refresh_token': refresh})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_logout_invalid_token(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post(self.logout_url, {'refresh_token': 'garbage'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
