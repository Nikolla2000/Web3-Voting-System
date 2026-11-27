"""generate_content's fallback between the primary and fallback Gemini
models. _generate (the retried API call) is mocked, so no request leaves
the process and tenacity's waits never run."""

from unittest.mock import AsyncMock

import pytest
from google.genai import errors

from ai_service.llm import gemini_client
from ai_service.llm.constants import GEMINI_FALLBACK_MODEL, GEMINI_MODEL

OVERLOADED = errors.ServerError(503, {"error": {"code": 503, "message": "high demand", "status": "UNAVAILABLE"}})
OUT_OF_QUOTA = errors.ClientError(429, {"error": {"code": 429, "message": "quota", "status": "RESOURCE_EXHAUSTED"}})
BAD_REQUEST = errors.ClientError(400, {"error": {"code": 400, "message": "bad", "status": "INVALID_ARGUMENT"}})


def patch_generate(mocker, *outcomes):
    return mocker.patch(
        "ai_service.llm.gemini_client._generate", new_callable=AsyncMock, side_effect=list(outcomes)
    )


def models_called(generate) -> list[str]:
    return [call.args[0] for call in generate.await_args_list]


async def test_uses_the_primary_model_when_it_answers(mocker):
    generate = patch_generate(mocker, "primary answer")

    assert await gemini_client.generate_content("hi") == "primary answer"
    assert models_called(generate) == [GEMINI_MODEL]


@pytest.mark.parametrize("error", [OVERLOADED, OUT_OF_QUOTA, TimeoutError()])
async def test_falls_back_when_the_primary_is_out_of_capacity(mocker, error):
    generate = patch_generate(mocker, error, "fallback answer")

    assert await gemini_client.generate_content("hi") == "fallback answer"
    assert models_called(generate) == [GEMINI_MODEL, GEMINI_FALLBACK_MODEL]


async def test_raises_llm_unavailable_when_both_models_are_out_of_capacity(mocker):
    patch_generate(mocker, OVERLOADED, TimeoutError())

    with pytest.raises(gemini_client.LlmUnavailableError):
        await gemini_client.generate_content("hi")


async def test_other_api_errors_propagate_without_a_fallback(mocker):
    generate = patch_generate(mocker, BAD_REQUEST)

    with pytest.raises(errors.ClientError):
        await gemini_client.generate_content("hi")
    assert models_called(generate) == [GEMINI_MODEL]
