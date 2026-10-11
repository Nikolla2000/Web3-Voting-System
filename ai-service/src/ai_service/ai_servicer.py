from grpclib.server import Stream

from ai_service.grpc_gen.ai_grpc import AiServiceBase
from ai_service.grpc_gen.ai_pb2 import (
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
from ai_service.moderation.neutrality_check import check_poll_neutrality
from ai_service.search.duplicate_detection import find_similar_polls
from ai_service.search.poll_search import search_polls


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
