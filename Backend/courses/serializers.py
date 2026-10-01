from rest_framework import serializers
from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'intro',
            'image_url',
            'rating',
            'students',
            'lessons',
            'duration',
            'price',
            'topics',
            'created_at',
            'updated_at'
        ]