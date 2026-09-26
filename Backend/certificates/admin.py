from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ("certificate_id", "user", "course", "issued_at")
    search_fields = (
        "certificate_id",
        "user__username",
        "course__title",
    )
    list_filter = ("issued_at",)