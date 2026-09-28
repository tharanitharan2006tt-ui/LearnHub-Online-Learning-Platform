from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from courses.models import Course
from .models import Lesson
from .serializers import LessonSerializer


class LessonListByCourseView(generics.ListAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_slug = self.kwargs['course_slug']

        return Lesson.objects.filter(
            course__slug=course_slug
        ).order_by('order')