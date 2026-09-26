from django.contrib import admin
from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'price',
        'rating',
        'students',
        'lessons',
        'created_at',
    )
    search_fields = (
        'title',
        'description',
    )
    prepopulated_fields = {
        'slug': ('title',)
    }
