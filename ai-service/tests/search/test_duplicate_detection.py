"""
Covers find_similar_polls' similarity-threshold filter (search/constants.py:
calibrated against real voyage-4-lite scores -- a near-duplicate scored
0.75-0.76, an unrelated poll scored 0.18; 0.70 sits between them). The
embedding call and DB session are mocked -- this is unit coverage of the
threshold decision itself, not of pgvector's actual ranking (that's a
candidate for a separate container-backed integration test, same
reasoning as the gateway's Redis-Lua-script one).
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from ai_service.search import duplicate_detection
from ai_service.search.constants import DUPLICATE_CHECK_SIMILARITY_THRESHOLD


class FakeAsyncSession:
    """Stands in for `async with async_session() as session:`. A plain
    class (not a Mock) implementing the real async context-manager
    protocol, so there's no dependency on how a given mock library version
    handles __aenter__/__aexit__ on MagicMock."""

    def __init__(self):
        self.execute = AsyncMock()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        return False


def make_row(poll_id: str, title: str, distance: float):
    return SimpleNamespace(poll_id=poll_id, title=title, distance=distance)


def patch_dependencies(mocker, rows: list, embedding=None):
    mocker.patch(
        "ai_service.search.duplicate_detection.embed_query",
        new_callable=AsyncMock,
        return_value=embedding or [0.1, 0.2, 0.3],
    )

    session = FakeAsyncSession()
    session.execute.return_value = SimpleNamespace(all=lambda: rows)
    # async_session() is called synchronously and its *result* is the async
    # context manager -- the patched replacement must be a plain callable
    # returning the fake session, not an AsyncMock (which would make
    # async_session() return a coroutine instead).
    mocker.patch("ai_service.search.duplicate_detection.async_session", new=lambda: session)
    return session


async def test_excludes_a_match_below_the_similarity_threshold(mocker):
    # similarity = 1 - distance, so a distance this much *above*
    # (1 - threshold) puts the similarity just *below* the threshold.
    distance_for_similarity_just_under_threshold = (1 - DUPLICATE_CHECK_SIMILARITY_THRESHOLD) + 0.01
    patch_dependencies(
        mocker,
        [make_row("poll-1", "Unrelated poll", distance=distance_for_similarity_just_under_threshold)],
    )

    matches = await duplicate_detection.find_similar_polls("New poll", "description")

    assert matches == []


async def test_includes_a_match_comfortably_above_the_threshold(mocker):
    # Deliberately not testing the exact boundary (similarity ==
    # threshold): that'd mean asserting on a float round-tripped through
    # two subtractions (1 - (1 - threshold)), which isn't guaranteed to
    # land on the identical double as the literal threshold itself. A
    # comfortable margin tests the real behavior without that risk.
    distance_for_similarity_above_threshold = (1 - DUPLICATE_CHECK_SIMILARITY_THRESHOLD) - 0.01
    patch_dependencies(
        mocker,
        [make_row("poll-1", "Near duplicate", distance=distance_for_similarity_above_threshold)],
    )

    matches = await duplicate_detection.find_similar_polls("New poll", "description")

    assert len(matches) == 1
    assert matches[0]["poll_id"] == "poll-1"
    assert matches[0]["title"] == "Near duplicate"
    assert matches[0]["similarity"] == pytest.approx(
        DUPLICATE_CHECK_SIMILARITY_THRESHOLD + 0.01
    )


async def test_filters_out_only_the_rows_below_threshold_keeping_the_rest(mocker):
    patch_dependencies(
        mocker,
        [
            make_row("poll-close", "Close match", distance=0.1),  # similarity 0.9
            make_row("poll-far", "Unrelated", distance=0.9),  # similarity 0.1
        ],
    )

    matches = await duplicate_detection.find_similar_polls("New poll", "description")

    assert [m["poll_id"] for m in matches] == ["poll-close"]


async def test_embeds_the_combined_title_and_description(mocker):
    embed_query = mocker.patch(
        "ai_service.search.duplicate_detection.embed_query",
        new_callable=AsyncMock,
        return_value=[0.1],
    )
    session = FakeAsyncSession()
    session.execute.return_value = SimpleNamespace(all=lambda: [])
    mocker.patch("ai_service.search.duplicate_detection.async_session", new=lambda: session)

    await duplicate_detection.find_similar_polls("My Title", "My description text")

    embed_query.assert_awaited_once_with("My Title\n\nMy description text")


async def test_no_matches_is_an_empty_list_not_an_error(mocker):
    patch_dependencies(mocker, [])

    matches = await duplicate_detection.find_similar_polls("title", "description")

    assert matches == []
