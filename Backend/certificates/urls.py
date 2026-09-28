from django.urls import path

from . import views


urlpatterns = [
    path(
        '',
        views.MyCertificateListView.as_view(),
        name='my-certificates',
    ),
    path(
        'generate/<int:course_id>/',
        views.GenerateCertificateView.as_view(),
        name='generate-certificate',
    ),
]