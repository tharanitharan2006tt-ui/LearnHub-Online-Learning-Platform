from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "enrolled_at")
    search_fields = (
        "user__username",
        "course__title",
    )
    list_filter = ("enrolled_at",)