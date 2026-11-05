"""
Covers search_polls' branching: a query with a topic left after filter
extraction ranks by cosine similarity (embedding call required), while a
pure filter query (e.g. "society polls starting in October", nothing left
to rank by) falls back to recency ordering with similarity pinned to 1.0
instead of embedding an empty string. extract_search_filters/embed_query/
the DB session are all mocked.

Deliberately stops short of asserting on the exact compiled SQL for the
category/date filters -- that would mean inspecting SQLAlchemy Select
internals I can't verify without running this, and reduces to "did the
right WHERE clause get built," which pgvector itself actually executing
against real stored vectors (a container-backed integration test, same
reasoning as the gateway's Redis-Lua-script one) would verify far more
convincingly anyway. What's checked here is the safe, stable invariant:
whether any filter clause was attached at all.
"""

import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from ai_service.search import poll_search
from ai_service.search.poll_search import _end_of_day, _start_of_day
from ai_service.search.query_parser import SearchFilters


class FakeAsyncSession:
    """See test_duplicate_detection.py's identical helper for why this is a
    plain class rather than a MagicMock-based async context manager."""

    def __init__(self):
        self.execute = AsyncMock()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc_info):
        return False


def make_filters(semantic_query="", category=None, starts_after=None, starts_before=None):
    return SearchFilters(
        semantic_query=semantic_query,
        category=category,
        starts_after=starts_after,
        starts_before=starts_before,
    )


def patch_dependencies(mocker, filters: SearchFilters, rows: list, embedding=None):
    mocker.patch(
        "ai_service.search.poll_search.extract_search_filters",
        new_callable=AsyncMock,
        return_value=filters,
    )
    embed_query = mocker.patch(
        "ai_service.search.poll_search.embed_query",
        new_callable=AsyncMock,
        return_value=embedding or [0.1, 0.2, 0.3],
    )

    session = FakeAsyncSession()
    session.execute.return_value = SimpleNamespace(all=lambda: rows)
    mocker.patch("ai_service.search.poll_search.async_session", new=lambda: session)

    return session, embed_query


class TestDateHelpers:
    def test_start_of_day_is_midnight_utc(self):
        result = _start_of_day(datetime.date(2026, 3, 15))

        assert result == datetime.datetime(2026, 3, 15, 0, 0, 0, tzinfo=datetime.timezone.utc)

    def test_end_of_day_is_the_last_microsecond_utc(self):
        result = _end_of_day(datetime.date(2026, 3, 15))

        assert result == datetime.datetime(
            2026, 3, 15, 23, 59, 59, 999999, tzinfo=datetime.timezone.utc
        )


class TestTopicBranch:
    async def test_ranks_by_similarity_and_embeds_the_topic(self, mocker):
        filters = make_filters(semantic_query="climate change")
        row = SimpleNamespace(poll_id="poll-1", distance=0.2)
        session, embed_query = patch_dependencies(mocker, filters, [row])

        results = await poll_search.search_polls("climate change polls")

        embed_query.assert_awaited_once_with("climate change")
        assert results == [{"poll_id": "poll-1", "similarity": pytest.approx(0.8)}]

    async def test_a_blank_semantic_query_after_stripping_counts_as_no_topic(self, mocker):
        filters = make_filters(semantic_query="   ")
        session, embed_query = patch_dependencies(mocker, filters, [])

        await poll_search.search_polls("   ")

        embed_query.assert_not_called()


class TestPureFilterBranch:
    async def test_does_not_embed_and_pins_similarity_to_one(self, mocker):
        filters = make_filters(semantic_query="", category="SOCIETY")
        row = SimpleNamespace(poll_id="poll-1")
        session, embed_query = patch_dependencies(mocker, filters, [row])

        results = await poll_search.search_polls("society polls")

        embed_query.assert_not_called()
        assert results == [{"poll_id": "poll-1", "similarity": 1.0}]

    async def test_multiple_results_all_get_similarity_one(self, mocker):
        filters = make_filters(semantic_query="")
        rows = [SimpleNamespace(poll_id="a"), SimpleNamespace(poll_id="b")]
        patch_dependencies(mocker, filters, rows)

        results = await poll_search.search_polls("polls")

        assert results == [{"poll_id": "a", "similarity": 1.0}, {"poll_id": "b", "similarity": 1.0}]


class TestFilterClauseAttachment:
    async def test_no_filters_means_no_where_clause(self, mocker):
        filters = make_filters(semantic_query="topic")
        session, _ = patch_dependencies(mocker, filters, [])

        await poll_search.search_polls("topic")

        stmt = session.execute.await_args.args[0]
        assert stmt.whereclause is None

    async def test_a_category_filter_attaches_a_where_clause(self, mocker):
        filters = make_filters(semantic_query="topic", category="POLITICS")
        session, _ = patch_dependencies(mocker, filters, [])

        await poll_search.search_polls("politics topic")

        stmt = session.execute.await_args.args[0]
        assert stmt.whereclause is not None

    async def test_date_filters_attach_a_where_clause(self, mocker):
        filters = make_filters(
            semantic_query="topic",
            starts_after=datetime.date(2026, 1, 1),
            starts_before=datetime.date(2026, 1, 31),
        )
        session, _ = patch_dependencies(mocker, filters, [])

        await poll_search.search_polls("topic in january")

        stmt = session.execute.await_args.args[0]
        assert stmt.whereclause is not None
