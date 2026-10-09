from grpclib.server import Stream

from ai_service.grpc_gen.ai_grpc import AiServiceBase
from ai_service.grpc_gen.ai_pb2 import CheckDuplicatePollRequest, CheckDuplicatePollResponse, DuplicateMatch
from ai_service.search.duplicate_detection import find_similar_polls


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
