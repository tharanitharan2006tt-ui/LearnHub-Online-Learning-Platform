import json
import os
from urllib.error import HTTPError, URLError
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .services import ChatbotServiceError, get_ai_reply


class ChatbotAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="learner@example.com",
            password="chatbot-test-password",
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
        self.assertIn("GEMINI_API_KEY is missing", response.data["error"])

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


class GeminiServiceTests(SimpleTestCase):
    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key"})
    @patch("chatbot.services.urlopen")
    def test_sends_gemini_request_and_returns_generated_text(self, urlopen):
        urlopen.return_value.__enter__.return_value.read.return_value = json.dumps(
            {
                "candidates": [
                    {"content": {"parts": [{"text": "A loop repeats instructions."}]}}
                ]
            }
        ).encode("utf-8")

        reply = get_ai_reply("Explain Python loops")

        self.assertEqual(reply, "A loop repeats instructions.")
        request = urlopen.call_args.args[0]
        self.assertEqual(request.get_method(), "POST")
        self.assertIn("gemini-3.5-flash:generateContent", request.full_url)
        self.assertEqual(request.get_header("X-goog-api-key"), "test-gemini-key")
        self.assertEqual(
            json.loads(request.data)["contents"][0]["parts"][0]["text"],
            "Explain Python loops",
        )
        self.assertEqual(urlopen.call_args.kwargs["timeout"], 30)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key"})
    @patch("chatbot.services.urlopen")
    def test_reports_http_errors_without_exposing_api_key(self, urlopen):
        urlopen.side_effect = HTTPError(
            "https://generativelanguage.googleapis.com/",
            403,
            "Forbidden",
            {},
            None,
        )

        with self.assertRaises(ChatbotServiceError) as raised:
            get_ai_reply("Explain Python loops")

        self.assertEqual(raised.exception.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertNotIn("test-gemini-key", str(raised.exception))

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key"})
    @patch("chatbot.services.urlopen")
    def test_falls_back_when_primary_model_is_unavailable(self, urlopen):
        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = json.dumps(
            {
                "candidates": [
                    {"content": {"parts": [{"text": "A loop repeats steps."}]}}
                ]
            }
        ).encode("utf-8")
        urlopen.side_effect = [
            HTTPError(
                "https://generativelanguage.googleapis.com/",
                503,
                "Unavailable",
                {},
                None,
            ),
            response,
        ]

        reply = get_ai_reply("Explain Python loops")

        self.assertEqual(reply, "A loop repeats steps.")
        self.assertEqual(urlopen.call_count, 2)
        self.assertIn(
            "models/gemini-3.5-flash:",
            urlopen.call_args_list[0].args[0].full_url,
        )
        self.assertIn(
            "models/gemini-3.1-flash-lite:",
            urlopen.call_args_list[1].args[0].full_url,
        )

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key"})
    @patch("chatbot.services.urlopen", side_effect=URLError("connection failed"))
    def test_reports_connection_errors(self, _urlopen):
        with self.assertRaises(ChatbotServiceError) as raised:
            get_ai_reply("Explain Python loops")

        self.assertIn("temporarily unavailable", str(raised.exception))

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-gemini-key"})
    @patch("chatbot.services.urlopen")
    def test_rejects_invalid_gemini_response(self, urlopen):
        urlopen.return_value.__enter__.return_value.read.return_value = (
            b'{"candidates":[]}'
        )

        with self.assertRaises(ChatbotServiceError) as raised:
            get_ai_reply("Explain Python loops")

        self.assertIn("invalid response", str(raised.exception))
