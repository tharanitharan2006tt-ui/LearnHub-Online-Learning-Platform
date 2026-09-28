from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = [
            'id',
            'certificate_id',
            'user',
            'course',
            'issued_at',
        ]
        read_only_fields = [
            'id',
            'certificate_id',
            'user',
            'issued_at',
        ]