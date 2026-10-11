from grpclib.server import Stream

from ai_service.grpc_gen.ai_grpc import AiServiceBase
from ai_service.grpc_gen.ai_pb2 import (
    CheckDuplicatePollRequest,
    CheckDuplicatePollResponse,
    DuplicateMatch,
    PollSearchResult,
    SearchPollsRequest,
    SearchPollsResponse,
)
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
