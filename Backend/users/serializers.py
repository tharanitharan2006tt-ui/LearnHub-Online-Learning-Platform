from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'password'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        email = validated_data['email']
        password = validated_data.pop('password')

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        UserProfile.objects.create(
            user=user,
            full_name=full_name
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            username=email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        refresh = RefreshToken.for_user(user)

        return {
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.profile.full_name
            },
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }


class ProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField()
    full_name = serializers.CharField(source='profile.full_name', max_length=150)

    def update(self, instance, validated_data):
        email = validated_data['email']
        other_users = User.objects.exclude(pk=instance.pk)
        if other_users.filter(email=email).exists() or other_users.filter(username=email).exists():
            raise serializers.ValidationError({
                'email': 'An account with this email already exists.'
            })

        instance.email = email
        instance.username = email
        instance.save(update_fields=['email', 'username'])

        profile = instance.profile
        profile.full_name = validated_data['profile']['full_name']
        profile.save(update_fields=['full_name'])
        return instance
