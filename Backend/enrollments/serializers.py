from rest_framework import serializers
from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(
        source='course.title',
        read_only=True
    )

    course_slug = serializers.CharField(
        source='course.slug',
        read_only=True
    )

    class Meta:
        model = Enrollment
        fields = [
            'id',
            'course',
            'course_title',
            'course_slug',
            'enrolled_at',
            'completed'
        ]
        read_only_fields = [
            'id',
            'enrolled_at',
            'completed'
        ]
