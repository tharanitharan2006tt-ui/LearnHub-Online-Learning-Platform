from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Enrollment
from .serializers import EnrollmentSerializer
from courses.models import Course


class EnrollmentCreateView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')

        if not course_id:
            return Response(
                {
                    'error': 'Course ID is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {
                    'error': 'Course not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=course
        )

        if not created:
            return Response(
                {
                    'message': 'You are already enrolled in this course.',
                    'enrollment': EnrollmentSerializer(
                        enrollment
                    ).data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                'message': 'Course enrollment successful.',
                'enrollment': EnrollmentSerializer(
                    enrollment
                ).data
            },
            status=status.HTTP_201_CREATED
        )


class MyLearningView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Enrollment.objects.filter(
            user=self.request.user
        ).select_related('course').order_by('-enrolled_at')