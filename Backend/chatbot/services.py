import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from rest_framework import status


logger = logging.getLogger(__name__)


class ChatbotServiceError(Exception):
    def __init__(self, message, status_code=status.HTTP_502_BAD_GATEWAY):
        super().__init__(message)
        self.status_code = status_code


def get_ai_reply(message):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.error("Chatbot is unavailable because OPENAI_API_KEY is not configured.")
        raise ChatbotServiceError(
            "The chatbot is not configured. Please contact the administrator.",
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    payload = {
        "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
        "messages": [
            {
                "role": "system",
                "content": "You are LearnHub's helpful learning assistant. Explain topics clearly and accurately.",
            },
            {"role": "user", "content": message},
        ],
    }
    request = Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        logger.warning("OpenAI returned HTTP %s for a chatbot request.", error.code)
        raise ChatbotServiceError(
            "The AI service could not process your request. Please try again."
        ) from error
    except (TimeoutError, URLError) as error:
        logger.warning("Unable to connect to OpenAI for a chatbot request: %s", error)
        raise ChatbotServiceError(
            "The AI service is temporarily unavailable. Please try again."
        ) from error
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        logger.exception("OpenAI returned an invalid response.")
        raise ChatbotServiceError(
            "The AI service returned an invalid response. Please try again."
        ) from error

    try:
        reply = result["choices"][0]["message"]["content"].strip()
    except (AttributeError, IndexError, KeyError, TypeError) as error:
        logger.exception("OpenAI response did not contain a valid chat reply.")
        raise ChatbotServiceError(
            "The AI service returned an invalid response. Please try again."
        ) from error

    if not reply:
        logger.error("OpenAI returned an empty chatbot reply.")
        raise ChatbotServiceError(
            "The AI service returned an empty response. Please try again."
        )

    return reply
