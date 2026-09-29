import os
from unittest.mock import patch

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class ChatbotAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="learner@example.com",
            password="test-password",
        )
        self.url = "/api/chatbot/"

    def test_chatbot_requires_authentication(self):
        response = self.client.post(self.url, {"message": "Explain Python loops"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_chatbot_rejects_empty_message(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.url, {"message": "   "})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch.dict(os.environ, {}, clear=True)
    def test_chatbot_reports_missing_provider_configuration(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(self.url, {"message": "Explain Python loops"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("not configured", response.data["error"])

    @patch("chatbot.views.get_ai_reply", return_value="A loop repeats instructions.")
    def test_chatbot_returns_ai_reply(self, get_ai_reply):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.url,
            {"message": "Explain Python loops"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"reply": "A loop repeats instructions."})
        get_ai_reply.assert_called_once_with("Explain Python loops")
