from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Quiz, QuizAttempt
from .serializers import QuizSerializer, QuizAttemptSerializer


class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]


class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response(
                {"detail": "Quiz not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        answers = request.data.get("answers", {})

        if not isinstance(answers, dict):
            return Response(
                {"detail": "Answers must be an object."},
                status=status.HTTP_400_BAD_REQUEST
            )

        questions = quiz.questions.prefetch_related("choices").all()

        total_questions = questions.count()

        if total_questions == 0:
            return Response(
                {"detail": "This quiz has no questions."},
                status=status.HTTP_400_BAD_REQUEST
            )

        correct_answers = 0

        for question in questions:
            selected_choice_id = answers.get(str(question.id))

            if selected_choice_id is None:
                continue

            try:
                selected_choice_id = int(selected_choice_id)
            except (TypeError, ValueError):
                continue

            correct_choice = question.choices.filter(
                is_correct=True
            ).first()

            if correct_choice and selected_choice_id == correct_choice.id:
                correct_answers += 1

        score = round(
            (correct_answers / total_questions) * 100
        )

        passed = score >= quiz.passing_score

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            passed=passed,
        )

        serializer = QuizAttemptSerializer(attempt)

        return Response(
            {
                "message": "Quiz submitted successfully.",
                "result": serializer.data,
                "total_questions": total_questions,
                "correct_answers": correct_answers,
            },
            status=status.HTTP_201_CREATED
        )