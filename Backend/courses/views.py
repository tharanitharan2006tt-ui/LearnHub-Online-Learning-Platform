from rest_framework import generics
from .models import Course
from .serializers import CourseSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'slug'
