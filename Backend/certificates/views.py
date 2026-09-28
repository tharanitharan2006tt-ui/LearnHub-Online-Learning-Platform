from uuid import uuid4

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Certificate
from .serializers import CertificateSerializer
from courses.models import Course
from progress.models import LessonProgress
from lessons.models import Lesson


class MyCertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(
            user=self.request.user
        ).order_by('-issued_at')


class GenerateCertificateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        total_lessons = Lesson.objects.filter(
            course=course
        ).count()

        completed_lessons = LessonProgress.objects.filter(
            user=request.user,
            lesson__course=course,
            completed=True
        ).count()

        if total_lessons == 0:
            return Response(
                {"detail": "This course has no lessons."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if completed_lessons < total_lessons:
            return Response(
                {
                    "detail": "Complete all lessons before generating the certificate.",
                    "total_lessons": total_lessons,
                    "completed_lessons": completed_lessons,
                    "progress_percentage": round(
                        (completed_lessons / total_lessons) * 100
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        certificate = Certificate.objects.filter(
            user=request.user,
            course=course
        ).first()

        if certificate:
            serializer = CertificateSerializer(certificate)

            return Response(
                {
                    "message": "Certificate already exists.",
                    "certificate": serializer.data,
                },
                status=status.HTTP_200_OK
            )

        certificate = Certificate.objects.create(
            user=request.user,
            course=course,
            certificate_id=f"CERT-{uuid4().hex[:12].upper()}",
        )

        serializer = CertificateSerializer(certificate)

        return Response(
            {
                "message": "Certificate generated successfully.",
                "certificate": serializer.data,
            },
            status=status.HTTP_201_CREATED
        )