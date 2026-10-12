import json
from typing import Any

from google import genai
from google.genai import errors, types
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ai_service.config.settings import settings
from ai_service.llm.constants import GEMINI_MODEL

client = genai.Client(api_key=settings.gemini_api_key)


# The free tier occasionally returns a transient 503 ("high demand") --
# observed live during development, not hypothetical -- so a short retry is
# warranted here specifically, unlike a generic "retry everything" policy.
@retry(
    retry=retry_if_exception_type(errors.ServerError),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    reraise=True,
)
async def generate_content(
    contents: Any, config: types.GenerateContentConfig | None = None
) -> types.GenerateContentResponse:
    return await client.aio.models.generate_content(model=GEMINI_MODEL, contents=contents, config=config)


async def extract_structured(prompt: str, json_schema: dict[str, Any]) -> dict[str, Any]:
    """One-shot structured extraction via Gemini's native JSON-schema response
    mode -- the response is guaranteed to match json_schema, no free-text
    parsing involved."""

    response = await generate_content(
        prompt,
        types.GenerateContentConfig(response_mime_type="application/json", response_json_schema=json_schema),
    )
    return json.loads(response.text)
