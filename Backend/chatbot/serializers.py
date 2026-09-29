from rest_framework import serializers


class ChatbotRequestSerializer(serializers.Serializer):
    message = serializers.CharField(
        allow_blank=False,
        max_length=4000,
        trim_whitespace=True,
    )
