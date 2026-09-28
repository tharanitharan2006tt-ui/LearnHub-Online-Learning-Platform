from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/enrollments/', include('enrollments.urls')),
    path('api/lessons/', include('lessons.urls')),
    path('api/progress/', include('progress.urls')),
    path('api/quizzes/', include('quizzes.urls')),
    path('api/certificates/', include('certificates.urls')),
]