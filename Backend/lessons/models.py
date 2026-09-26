from django.db import models
from courses.models import Course


class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lessons_list'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    duration = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0.0
    )
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']
        unique_together = ('course', 'order')

    def __str__(self):
        return f'{self.course.title} - {self.title}'