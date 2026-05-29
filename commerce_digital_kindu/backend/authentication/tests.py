from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class AuthAPITests(APITestCase):
    def setUp(self):
        self.username = 'testuser'
        self.email = 'testuser@example.com'
        self.password = 'secret123'
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.refresh_url = '/api/auth/refresh/'
        self.logout_url = '/api/auth/logout/'
        self.me_url = '/api/auth/me/'

    def test_register_user(self):
        response = self.client.post(
            self.register_url,
            {
                'username': self.username,
                'email': self.email,
                'password': self.password,
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], self.username)
        self.assertEqual(response.data['email'], self.email)
        self.assertNotIn('password', response.data)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)

    def test_login_returns_tokens_and_user(self):
        User.objects.create_user(username=self.username, email=self.email, password=self.password)
        response = self.client.post(
            self.login_url,
            {'username': self.username, 'password': self.password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], self.username)
        self.assertEqual(response.data['user']['email'], self.email)

    def test_refresh_token_and_logout(self):
        User.objects.create_user(username=self.username, email=self.email, password=self.password)
        login_response = self.client.post(
            self.login_url,
            {'username': self.username, 'password': self.password},
            format='json',
        )
        refresh_token = login_response.data['refresh']

        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json',
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)
        self.assertIn('refresh', refresh_response.data)

        new_refresh_token = refresh_response.data['refresh']
        new_access_token = refresh_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access_token}')
        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data['username'], self.username)
        self.assertEqual(me_response.data['email'], self.email)

        logout_response = self.client.post(
            self.logout_url,
            {'refresh': new_refresh_token},
            format='json',
        )
        self.assertEqual(logout_response.status_code, status.HTTP_204_NO_CONTENT)

        refresh_after_logout = self.client.post(
            self.refresh_url,
            {'refresh': new_refresh_token},
            format='json',
        )
        self.assertEqual(refresh_after_logout.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(refresh_after_logout.data['detail'].code, 'token_not_valid')

    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_invalid_credentials(self):
        User.objects.create_user(username=self.username, email=self.email, password=self.password)
        response = self.client.post(
            self.login_url,
            {'username': self.username, 'password': 'wrongpassword'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
