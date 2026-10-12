from grpclib.client import Channel

from ai_service.grpc_gen.polls_pb2 import GetPollByIdRequest, GetPollsRequest
from ai_service.grpc_gen.polls_grpc import PollsServiceStub

POLLS_SERVICE_HOST = "127.0.0.1"
POLLS_SERVICE_PORT = 3002


def _poll_to_dict(poll) -> dict:
    return {
        "id": poll.id,
        "title": poll.title,
        "description": poll.description,
        "category": poll.category,
        "startsAt": poll.startsAt,
        "endsAt": poll.endsAt,
        "totalVotes": poll.totalVotes,
        "options": [{"label": o.label, "votes": o.votes} for o in poll.options],
    }


async def get_polls(search: str = "", status: str = "", sort_by: str = "", page: int = 1, limit: int = 10) -> dict:
    async with Channel(POLLS_SERVICE_HOST, POLLS_SERVICE_PORT) as channel:
        stub = PollsServiceStub(channel)
        response = await stub.GetPolls(
            GetPollsRequest(search=search, status=status, sortBy=sort_by, page=page, limit=limit)
        )
        return {
            "items": [_poll_to_dict(p) for p in response.items],
            "total": response.total,
        }


async def get_poll_by_id(poll_id: str) -> dict:
    async with Channel(POLLS_SERVICE_HOST, POLLS_SERVICE_PORT) as channel:
        stub = PollsServiceStub(channel)
        response = await stub.GetPollById(GetPollByIdRequest(id=poll_id))
        return _poll_to_dict(response)
