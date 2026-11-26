from collections.abc import Iterator
from contextlib import contextmanager

from grpclib import GRPCError, Status
from grpclib.server import Stream

from ai_service.grpc_gen.ai_grpc import AiServiceBase
from ai_service.grpc_gen.ai_pb2 import (
    ChatChunk,
    ChatRequest,
    CheckDuplicatePollRequest,
    CheckDuplicatePollResponse,
    CheckPollNeutralityRequest,
    CheckPollNeutralityResponse,
    DuplicateMatch,
    NeutralityIssue,
    PollSearchResult,
    SearchPollsRequest,
    SearchPollsResponse,
)
from ai_service.llm.gemini_client import LlmUnavailableError
from ai_service.moderation.neutrality_check import check_poll_neutrality
from ai_service.qa_agent.chat import stream_chat_response
from ai_service.search.duplicate_detection import find_similar_polls
from ai_service.search.poll_search import search_polls


@contextmanager
def _llm_unavailable_as_grpc() -> Iterator[None]:
    # UNAVAILABLE (not grpclib's default UNKNOWN) lets the gateway tell the
    # user to try again later instead of reporting a generic failure.
    try:
        yield
    except LlmUnavailableError as error:
        raise GRPCError(Status.UNAVAILABLE, "The AI model is busy right now") from error


class AiServicer(AiServiceBase):
    async def CheckDuplicatePoll(
        self, stream: Stream[CheckDuplicatePollRequest, CheckDuplicatePollResponse]
    ) -> None:
        request = await stream.recv_message()
        matches = await find_similar_polls(request.title, request.description)

        await stream.send_message(
            CheckDuplicatePollResponse(
                matches=[
                    DuplicateMatch(pollId=m["poll_id"], title=m["title"], similarity=m["similarity"])
                    for m in matches
                ]
            )
        )

    async def SearchPolls(self, stream: Stream[SearchPollsRequest, SearchPollsResponse]) -> None:
        request = await stream.recv_message()
        with _llm_unavailable_as_grpc():
            results = await search_polls(request.query)

        await stream.send_message(
            SearchPollsResponse(
                results=[PollSearchResult(pollId=r["poll_id"], similarity=r["similarity"]) for r in results]
            )
        )

    async def CheckPollNeutrality(
        self, stream: Stream[CheckPollNeutralityRequest, CheckPollNeutralityResponse]
    ) -> None:
        request = await stream.recv_message()
        with _llm_unavailable_as_grpc():
            result = await check_poll_neutrality(request.title, list(request.options))

        await stream.send_message(
            CheckPollNeutralityResponse(
                isNeutral=result.is_neutral,
                issues=[
                    NeutralityIssue(text=i.text, explanation=i.explanation, suggestion=i.suggestion)
                    for i in result.issues
                ],
            )
        )

    async def Chat(self, stream: Stream[ChatRequest, ChatChunk]) -> None:
        request = await stream.recv_message()
        history = [{"role": turn.role, "content": turn.content} for turn in request.history]

        with _llm_unavailable_as_grpc():
            async for text_delta in stream_chat_response(request.message, history):
                await stream.send_message(ChatChunk(textDelta=text_delta))
