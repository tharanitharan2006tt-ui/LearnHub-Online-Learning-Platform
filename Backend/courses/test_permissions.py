from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Course


class CoursePermissionTests(APITestCase):
    def setUp(self):
        self.course = Course.objects.create(
            title='Test Course',
            slug='test-course',
            description='Test description',
            intro='Test intro',
            price='10.00',
            topics='Test topic',
        )

    def test_course_reads_are_public(self):
        list_response = self.client.get('/api/courses/')
        detail_response = self.client.get('/api/courses/test-course/')

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)

    def test_learner_cannot_create_or_modify_courses(self):
        learner = User.objects.create_user(
            username='learner@example.com',
            email='learner@example.com',
            password='test-password',
        )
        self.client.force_authenticate(user=learner)

        create_response = self.client.post('/api/courses/', {
            'title': 'Unauthorized Course',
            'slug': 'unauthorized-course',
            'description': 'No',
            'intro': 'No',
            'price': '10.00',
            'topics': 'No',
        }, format='json')
        update_response = self.client.patch(
            '/api/courses/test-course/',
            {'title': 'Changed'},
            format='json',
        )
        delete_response = self.client.delete('/api/courses/test-course/')

        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_user_can_create_course(self):
        staff = User.objects.create_user(
            username='staff@example.com',
            email='staff@example.com',
            password='test-password',
            is_staff=True,
        )
        self.client.force_authenticate(user=staff)

        response = self.client.post('/api/courses/', {
            'title': 'Staff Course',
            'slug': 'staff-course',
            'description': 'Staff description',
            'intro': 'Staff intro',
            'price': '20.00',
            'topics': 'Staff topic',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
