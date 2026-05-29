from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

User = get_user_model()
USERNAME_REGEX = r'^[A-Za-z0-9_]{3,30}$'

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        required=True,
        min_length=3,
        max_length=30,
        validators=[
            RegexValidator(
                regex=USERNAME_REGEX,
                message='Le nom d’utilisateur doit contenir 3 à 30 caractères alphanumériques ou underscore.',
            ),
            UniqueValidator(queryset=User.objects.all(), message='Ce nom d’utilisateur est déjà utilisé.'),
        ],
    )
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(queryset=User.objects.all(), message='Cet email est déjà utilisé.'),
        ],
    )
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id', 'username', 'email']
