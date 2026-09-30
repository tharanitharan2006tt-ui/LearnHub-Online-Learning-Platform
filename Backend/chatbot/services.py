import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from rest_framework import status


logger = logging.getLogger(__name__)
GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/{model}:generateContent"
)
GEMINI_MODELS = ("gemini-3.5-flash", "gemini-3.1-flash-lite")
SYSTEM_INSTRUCTION = (
    "You are LearnHub's helpful learning assistant. "
    "Explain topics clearly and accurately."
)


class ChatbotServiceError(Exception):
    def __init__(self, message, status_code=status.HTTP_502_BAD_GATEWAY):
        super().__init__(message)
        self.status_code = status_code


def get_ai_reply(message):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error(
            "Chatbot is unavailable because GEMINI_API_KEY is not configured."
        )
        raise ChatbotServiceError(
            "Chatbot is unavailable because GEMINI_API_KEY is missing. "
            "Add it to the backend environment and restart the server.",
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "contents": [{"role": "user", "parts": [{"text": message}]}],
    }
    result = None
    response_received = False
    last_transient_error = None
    for model in GEMINI_MODELS:
        request = Request(
            GEMINI_API_URL.format(model=model),
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "x-goog-api-key": api_key,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=30) as response:
                result = json.loads(response.read().decode("utf-8"))
            response_received = True
            break
        except HTTPError as error:
            if error.code == 429 or error.code >= 500:
                logger.warning(
                    "Gemini model %s returned HTTP %s; trying the next model.",
                    model,
                    error.code,
                )
                last_transient_error = error
                continue
            logger.warning("Gemini returned HTTP %s for a chatbot request.", error.code)
            raise ChatbotServiceError(
                "The AI service could not process your request. Please try again."
            ) from error
        except (TimeoutError, URLError) as error:
            logger.warning(
                "Gemini model %s failed (%s); trying the next model.",
                model,
                type(error).__name__,
            )
            last_transient_error = error
            continue
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            logger.exception("Gemini returned an invalid JSON response.")
            raise ChatbotServiceError(
                "The AI service returned an invalid response. Please try again."
            ) from error

    if not response_received:
        logger.error("All configured Gemini models are currently unavailable.")
        raise ChatbotServiceError(
            "The AI service is temporarily unavailable. Please try again.",
            status.HTTP_503_SERVICE_UNAVAILABLE,
        ) from last_transient_error

    try:
        candidates = result["candidates"]
        parts = candidates[0]["content"]["parts"]
        reply = "\n".join(
            part["text"]
            for part in parts
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        ).strip()
    except (AttributeError, IndexError, KeyError, TypeError) as error:
        logger.exception("Gemini response did not contain a valid chat reply.")
        raise ChatbotServiceError(
            "The AI service returned an invalid response. Please try again."
        ) from error

    if not reply:
        logger.error("Gemini returned an empty chatbot reply.")
        raise ChatbotServiceError(
            "The AI service returned an empty response. Please try again."
        )

    return reply
