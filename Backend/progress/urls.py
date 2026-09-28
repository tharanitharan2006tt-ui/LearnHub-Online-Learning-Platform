from django.urls import path

from . import views


urlpatterns = [
    path(
        '',
        views.LessonProgressListCreateView.as_view(),
        name='lesson-progress-list-create',
    ),
    path(
        'course/<int:course_id>/',
        views.CourseProgressView.as_view(),
        name='course-progress',
    ),
]