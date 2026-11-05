"""
Covers stream_chat_response's tool-call loop: the actual control flow of
the Q&A agent (CLAUDE.md: "not RAG... tool-calling agent"). generate_content
(Gemini) and execute_tool are both mocked — this is unit coverage of the
loop's own decisions (when to stop, when to drop tools, what happens if the
model never stops asking for tools), not of Gemini's or the real polls
gRPC client's behavior.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock

from ai_service.qa_agent import chat


def make_response(function_calls=None, text=None):
    """A stand-in for google.genai's GenerateContentResponse, shaped to
    match only what stream_chat_response actually reads off it."""
    return SimpleNamespace(
        function_calls=function_calls or [],
        text=text,
        candidates=[SimpleNamespace(content=SimpleNamespace(marker="model-turn"))],
    )


def make_call(name: str, args: dict):
    return SimpleNamespace(name=name, args=args)


def patch_generate_content(mocker, **kwargs):
    # Explicit AsyncMock rather than relying on mocker.patch's automatic
    # async-detection: generate_content is wrapped by tenacity's @retry,
    # and asyncio.iscoroutinefunction's behavior through that wrapper isn't
    # worth depending on here.
    return mocker.patch(
        "ai_service.qa_agent.chat.generate_content", new_callable=AsyncMock, **kwargs
    )


def patch_execute_tool(mocker, **kwargs):
    return mocker.patch(
        "ai_service.qa_agent.chat.execute_tool", new_callable=AsyncMock, **kwargs
    )


async def collect(message: str, history: list[dict]) -> list[str]:
    return [chunk async for chunk in chat.stream_chat_response(message, history)]


async def test_answers_directly_when_the_model_needs_no_tools(mocker):
    generate_content = patch_generate_content(
        mocker, return_value=make_response(text="42 votes.")
    )
    execute_tool = patch_execute_tool(mocker)

    chunks = await collect("How many votes?", [])

    assert chunks == ["42 votes."]
    execute_tool.assert_not_called()
    generate_content.assert_awaited_once()


async def test_yields_an_empty_string_rather_than_none_when_text_is_missing(mocker):
    patch_generate_content(mocker, return_value=make_response(text=None))
    patch_execute_tool(mocker)

    chunks = await collect("hi", [])

    assert chunks == [""]


async def test_history_and_the_new_message_are_both_sent_to_the_model(mocker):
    generate_content = patch_generate_content(mocker, return_value=make_response(text="ok"))
    patch_execute_tool(mocker)

    history = [{"role": "user", "content": "earlier question"}]
    await collect("follow-up question", history)

    contents = generate_content.await_args.args[0]
    assert [c.parts[0].text for c in contents] == ["earlier question", "follow-up question"]
    assert [c.role for c in contents] == ["user", "user"]


async def test_executes_a_requested_tool_then_answers_on_the_next_round(mocker):
    call = make_call("get_poll_by_id", {"id": "poll-1"})
    generate_content = patch_generate_content(
        mocker,
        side_effect=[
            make_response(function_calls=[call]),
            make_response(text="It has 10 votes."),
        ],
    )
    execute_tool = patch_execute_tool(mocker, return_value={"totalVotes": 10})

    chunks = await collect("How many votes does poll-1 have?", [])

    assert chunks == ["It has 10 votes."]
    execute_tool.assert_awaited_once_with("get_poll_by_id", {"id": "poll-1"})
    assert generate_content.await_count == 2


async def test_drops_the_tools_config_on_the_final_round(mocker):
    call = make_call(
        "get_polls", {"search": "", "status": "all", "sortBy": "newest", "limit": 10}
    )
    generate_content = patch_generate_content(
        mocker, return_value=make_response(function_calls=[call])
    )
    patch_execute_tool(mocker, return_value={"items": []})

    chunks = await collect("what polls are there?", [])

    # The model kept asking for tools every round, so the loop never finds
    # a stopping point on its own and falls through to the fixed fallback.
    assert chunks == [
        "I wasn't able to find a clear answer to that -- could you try rephrasing?"
    ]
    assert generate_content.await_count == chat.MAX_TOOL_ROUNDS

    configs_used = [call_args.args[1] for call_args in generate_content.await_args_list]
    # Every round but the last still offers tools; the last round's config
    # must not, so a confused model is forced to answer from what it has
    # rather than loop forever.
    assert all(cfg.tools for cfg in configs_used[:-1])
    assert not configs_used[-1].tools


async def test_tool_execution_continues_even_on_the_final_round(mocker):
    # The loop doesn't special-case "this is the last round" when deciding
    # whether to execute a requested tool call — only the config passed to
    # generate_content changes. A call requested on the final round (however
    # unlikely, since that round's config has no tools) still gets executed
    # before the fallback message is yielded.
    call = make_call(
        "get_polls", {"search": "", "status": "all", "sortBy": "newest", "limit": 10}
    )
    patch_generate_content(mocker, return_value=make_response(function_calls=[call]))
    execute_tool = patch_execute_tool(mocker, return_value={"items": []})

    await collect("what polls are there?", [])

    assert execute_tool.await_count == chat.MAX_TOOL_ROUNDS
