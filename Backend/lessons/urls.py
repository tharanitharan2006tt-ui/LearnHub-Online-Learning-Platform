from django.urls import path

from . import views


urlpatterns = [
    path(
        'course/<slug:course_slug>/',
        views.LessonListByCourseView.as_view(),
        name='lesson-list-by-course',
    ),
]