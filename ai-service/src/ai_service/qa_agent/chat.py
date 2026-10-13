from collections.abc import AsyncIterator

from google.genai import types

from ai_service.llm.gemini_client import generate_content
from ai_service.qa_agent.tools import TOOLS, execute_tool

SYSTEM_INSTRUCTION = (
    "You are the Q&A assistant for VoteChain, a decentralized voting platform. Answer questions about "
    "polls (vote counts, dates, status, categories) using the get_polls and get_poll_by_id tools -- "
    "never guess or estimate a number, always look it up. Keep answers brief and conversational. If a "
    "question has nothing to do with polls or this platform, say so rather than making something up."
)

# Caps the tool-call loop so a confused model can't spin forever -- after this
# many rounds, the next call drops the tools so it's forced to answer with
# whatever it's already gathered.
MAX_TOOL_ROUNDS = 4


def _history_to_contents(history: list[dict]) -> list[types.Content]:
    return [types.Content(role=turn["role"], parts=[types.Part(text=turn["content"])]) for turn in history]


async def stream_chat_response(message: str, history: list[dict]) -> AsyncIterator[str]:
    contents = _history_to_contents(history)
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    config = types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION, tools=TOOLS)

    final_round_config = types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION)

    for round_index in range(MAX_TOOL_ROUNDS):
        response = await generate_content(
            contents, config if round_index < MAX_TOOL_ROUNDS - 1 else final_round_config
        )

        if not response.function_calls:
            # Sent as one chunk rather than re-issued through
            # generate_content_stream for true token-by-token streaming --
            # that would cost a second paid generation call per message just
            # for display polish. The gRPC/SSE streaming plumbing is real;
            # only this call's granularity is simplified.
            yield response.text or ""
            return

        contents.append(response.candidates[0].content)
        response_parts = []
        for call in response.function_calls:
            result = await execute_tool(call.name, dict(call.args))
            response_parts.append(types.Part(function_response=types.FunctionResponse(name=call.name, response=result)))
        contents.append(types.Content(role="user", parts=response_parts))

    yield "I wasn't able to find a clear answer to that -- could you try rephrasing?"
