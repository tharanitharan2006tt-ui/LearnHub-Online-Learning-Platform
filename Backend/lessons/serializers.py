from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist

from .models import Lesson


class LessonSerializer(serializers.ModelSerializer):
    quiz_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'

    def get_quiz_id(self, lesson):
        try:
            return lesson.quiz.id
        except ObjectDoesNotExist:
            return None