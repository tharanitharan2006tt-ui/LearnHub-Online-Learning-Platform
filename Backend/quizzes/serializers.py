from rest_framework import serializers

from .models import Quiz, Question, Choice, QuizAttempt


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Question
        fields = [
            'id',
            'question_text',
            'order',
            'choices',
        ]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(
        many=True,
        read_only=True
    )
    course_id = serializers.IntegerField(source='lesson.course_id', read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id',
            'lesson',
            'course_id',
            'title',
            'passing_score',
            'created_at',
            'questions',
        ]


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = [
            'id',
            'quiz',
            'score',
            'passed',
            'completed_at',
        ]
        read_only_fields = [
            'score',
            'passed',
            'completed_at',
        ]