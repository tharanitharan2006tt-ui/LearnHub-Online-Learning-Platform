from django.db import models


class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    intro = models.TextField()
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0.0
    )
    students = models.PositiveIntegerField(default=0)
    lessons = models.PositiveIntegerField(default=0)
    duration = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0.0
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    topics = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title