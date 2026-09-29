from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import UserProfile


class ProfileApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='student@example.com',
            email='student@example.com',
            password='initial-password-123',
        )
        UserProfile.objects.create(user=self.user, full_name='Student Name')
        self.client.force_authenticate(user=self.user)

    def test_profile_can_be_retrieved_and_updated(self):
        response = self.client.get('/api/users/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Student Name')

        response = self.client.patch('/api/users/profile/', {
            'full_name': 'Updated Student',
            'email': 'updated@example.com',
        }, format='json')

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.email, 'updated@example.com')
        self.assertEqual(self.user.username, 'updated@example.com')
        self.assertEqual(self.user.profile.full_name, 'Updated Student')

    def test_profile_rejects_email_already_in_use(self):
        User.objects.create_user(
            username='taken@example.com',
            email='taken@example.com',
            password='another-password-123',
        )

        response = self.client.patch('/api/users/profile/', {
            'full_name': 'Student Name',
            'email': 'taken@example.com',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
