import json
import logging
from typing import Any

from google import genai
from google.genai import errors, types
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ai_service.config.settings import settings
from ai_service.llm.constants import GEMINI_FALLBACK_MODEL, GEMINI_MODEL

logger = logging.getLogger(__name__)

# Without a timeout a stalled request hangs the chat indefinitely (seen live).
# Hitting it raises the builtin TimeoutError, which is treated like an outage.
REQUEST_TIMEOUT_MS = 30_000

client = genai.Client(api_key=settings.gemini_api_key, http_options=types.HttpOptions(timeout=REQUEST_TIMEOUT_MS))


class LlmUnavailableError(Exception):
    """Both models are overloaded, out of quota or timing out. Callers surface
    this as a "try again later" rather than a generic failure."""


def _is_capacity_error(error: Exception) -> bool:
    if isinstance(error, TimeoutError):
        return True
    return isinstance(error, errors.ServerError) or (isinstance(error, errors.APIError) and error.code == 429)


# The free tier occasionally returns a transient 503 ("high demand") --
# observed live during development, not hypothetical -- so a short retry is
# warranted here specifically, unlike a generic "retry everything" policy.
@retry(
    retry=retry_if_exception_type(errors.ServerError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    reraise=True,
)
async def _generate(
    model: str, contents: Any, config: types.GenerateContentConfig | None
) -> types.GenerateContentResponse:
    return await client.aio.models.generate_content(model=model, contents=contents, config=config)


async def generate_content(
    contents: Any, config: types.GenerateContentConfig | None = None
) -> types.GenerateContentResponse:
    """Retries GEMINI_MODEL briefly on a 503, then falls back to
    GEMINI_FALLBACK_MODEL on a 503 that outlasts the retries, a 429 or a
    timeout. Raises LlmUnavailableError if both are out of capacity; any
    other API error propagates unchanged."""

    try:
        return await _generate(GEMINI_MODEL, contents, config)
    except (errors.APIError, TimeoutError) as error:
        if not _is_capacity_error(error):
            raise
        logger.warning("%s unavailable (%r), falling back to %s", GEMINI_MODEL, error, GEMINI_FALLBACK_MODEL)

    try:
        return await _generate(GEMINI_FALLBACK_MODEL, contents, config)
    except (errors.APIError, TimeoutError) as error:
        if not _is_capacity_error(error):
            raise
        raise LlmUnavailableError(f"Gemini models unavailable: {error!r}") from error


async def extract_structured(prompt: str, json_schema: dict[str, Any]) -> dict[str, Any]:
    """One-shot structured extraction via Gemini's native JSON-schema response
    mode -- the response is guaranteed to match json_schema, no free-text
    parsing involved."""

    response = await generate_content(
        prompt,
        types.GenerateContentConfig(response_mime_type="application/json", response_json_schema=json_schema),
    )
    return json.loads(response.text)
