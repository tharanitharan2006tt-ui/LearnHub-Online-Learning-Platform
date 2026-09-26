from django.urls import path

from .views import (
    EnrollmentCreateView,
    MyLearningView
)


urlpatterns = [
    path(
        '',
        EnrollmentCreateView.as_view(),
        name='enroll-course'
    ),
    path(
        'my-learning/',
        MyLearningView.as_view(),
        name='my-learning'
    ),
]