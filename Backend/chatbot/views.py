from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ChatbotRequestSerializer
from .services import ChatbotServiceError, get_ai_reply


class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatbotRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reply = get_ai_reply(serializer.validated_data["message"])
        except ChatbotServiceError as error:
            return Response(
                {"error": str(error)},
                status=error.status_code,
            )

        return Response({"reply": reply}, status=status.HTTP_200_OK)
