"""execute_tool's get_polls handling. The polls gRPC client is mocked; this
covers the fallback from a title search that matched nothing to the full
listing, which is what lets the model answer topic questions."""

from unittest.mock import AsyncMock

from ai_service.qa_agent import tools

POLL = {"id": "p1", "title": "Which sport is the most exciting to watch live?", "category": "SPORTS"}


def patch_get_polls(mocker, *results):
    return mocker.patch("ai_service.qa_agent.tools.get_polls", new_callable=AsyncMock, side_effect=list(results))


async def test_returns_title_matches_as_they_are(mocker):
    get_polls = patch_get_polls(mocker, {"items": [POLL], "total": 1})

    result = await tools.execute_tool(
        "get_polls", {"search": "sport", "status": "all", "sortBy": "newest", "limit": 10}
    )

    assert result == {"items": [POLL], "total": 1}
    get_polls.assert_awaited_once_with(search="sport", status="all", sort_by="newest", limit=10)


async def test_falls_back_to_all_polls_when_the_search_matches_nothing(mocker):
    get_polls = patch_get_polls(mocker, {"items": [], "total": 0}, {"items": [POLL], "total": 1})

    result = await tools.execute_tool(
        "get_polls", {"search": "sports", "status": "active", "sortBy": "newest", "limit": 10}
    )

    assert result["items"] == [POLL]
    assert "sports" in result["note"]
    assert get_polls.await_args_list[1].kwargs == {
        "search": "",
        "status": "active",
        "sort_by": "newest",
        "limit": tools.MAX_LIMIT,
    }


async def test_an_empty_listing_without_a_search_is_not_retried(mocker):
    get_polls = patch_get_polls(mocker, {"items": [], "total": 0})

    result = await tools.execute_tool(
        "get_polls", {"search": "", "status": "ended", "sortBy": "newest", "limit": 10}
    )

    assert result == {"items": [], "total": 0}
    get_polls.assert_awaited_once()


async def test_caps_the_limit(mocker):
    get_polls = patch_get_polls(mocker, {"items": [POLL], "total": 1})

    await tools.execute_tool("get_polls", {"search": "", "status": "all", "sortBy": "newest", "limit": 500})

    assert get_polls.await_args.kwargs["limit"] == tools.MAX_LIMIT
