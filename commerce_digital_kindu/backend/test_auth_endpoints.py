import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core_project.settings')
import django

django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()
client = APIClient()

print('Cleaning up existing test user if any...')
User.objects.filter(username='testuser').delete()

print('1) Testing /api/auth/register/')
response = client.post('/api/auth/register/', {'username': 'testuser', 'email': 'testuser@example.com', 'password': 'secret123'}, format='json')
print('status:', response.status_code)
print(response.json())

print('\n2) Testing /api/auth/login/')
response = client.post('/api/auth/login/', {'username': 'testuser', 'password': 'secret123'}, format='json')
print('status:', response.status_code)
body = response.json()
print(body)
access = body.get('access')
refresh = body.get('refresh')

print('\n3) Testing /api/auth/refresh/')
response = client.post('/api/auth/refresh/', {'refresh': refresh}, format='json')
print('status:', response.status_code)
print(response.json())
refresh_data = response.json()
new_access = refresh_data.get('access')
refresh = refresh_data.get('refresh', refresh)

print('\n4) Testing /api/auth/me/')
client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access}')
response = client.get('/api/auth/me/')
print('status:', response.status_code)
print(response.json())

print('\n5) Testing /api/auth/logout/')
response = client.post('/api/auth/logout/', {'refresh': refresh}, format='json')
print('status:', response.status_code)
print(response.content.decode('utf-8') or '<empty>')

print('\n6) Testing invalid refresh after logout (should fail)')
response = client.post('/api/auth/refresh/', {'refresh': refresh}, format='json')
print('status:', response.status_code)
print(response.json())
