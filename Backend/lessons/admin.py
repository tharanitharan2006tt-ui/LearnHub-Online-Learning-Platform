from django.contrib import admin
from .models import Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "duration",
        "order",
        "created_at",
    )
    list_filter = ("course",)
    search_fields = (
        "title",
        "description",
        "course__title",
    )
    ordering = ("course", "order")