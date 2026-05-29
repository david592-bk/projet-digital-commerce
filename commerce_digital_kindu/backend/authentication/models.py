from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)

    ROLE_CHOICES = [
        ('buyer', 'Acheteur'),
        ('merchant', 'Entrepreneur'),
        ('delivery', 'Livreur'),
        ('admin', 'Administrateur'),
    ]
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default='buyer')
    phone = models.CharField(max_length=24, blank=True)
    address = models.CharField(max_length=255, blank=True)

    REQUIRED_FIELDS = ['email']
    EMAIL_FIELD = 'email'

    def __str__(self):
        return self.username
