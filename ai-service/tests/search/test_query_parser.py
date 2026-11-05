"""
Covers extract_search_filters' mapping from Gemini's structured-extraction
output to SearchFilters — specifically the _NO_CATEGORY sentinel (Gemini's
response_json_schema can't express "not specified" via nullable cleanly,
per the comment in query_parser.py) and date parsing. extract_structured
is mocked; this is not a test of Gemini's own extraction quality.
"""

import datetime
from unittest.mock import AsyncMock

from ai_service.search.query_parser import _parse_date, extract_search_filters


class TestParseDate:
    def test_parses_a_valid_iso_date(self):
        assert _parse_date("2026-01-15") == datetime.date(2026, 1, 15)

    def test_none_for_an_empty_string(self):
        assert _parse_date("") is None

    def test_none_for_none(self):
        assert _parse_date(None) is None


def patch_extract_structured(mocker, return_value):
    return mocker.patch(
        "ai_service.search.query_parser.extract_structured",
        new_callable=AsyncMock,
        return_value=return_value,
    )


class TestExtractSearchFilters:
    async def test_maps_the_no_category_sentinel_to_none(self, mocker):
        patch_extract_structured(
            mocker,
            {
                "semantic_query": "climate change",
                "category": "NONE",
                "starts_after": "",
                "starts_before": "",
            },
        )

        filters = await extract_search_filters("climate change polls")

        assert filters.category is None

    async def test_passes_through_a_real_category(self, mocker):
        patch_extract_structured(
            mocker,
            {
                "semantic_query": "",
                "category": "POLITICS",
                "starts_after": "",
                "starts_before": "",
            },
        )

        filters = await extract_search_filters("politics polls")

        assert filters.category == "POLITICS"

    async def test_parses_both_date_bounds_when_present(self, mocker):
        patch_extract_structured(
            mocker,
            {
                "semantic_query": "",
                "category": "NONE",
                "starts_after": "2026-02-01",
                "starts_before": "2026-02-28",
            },
        )

        filters = await extract_search_filters("polls in february")

        assert filters.starts_after == datetime.date(2026, 2, 1)
        assert filters.starts_before == datetime.date(2026, 2, 28)

    async def test_missing_date_bounds_become_none_not_empty_string(self, mocker):
        patch_extract_structured(
            mocker,
            {"semantic_query": "tech", "category": "NONE", "starts_after": "", "starts_before": ""},
        )

        filters = await extract_search_filters("tech polls")

        assert filters.starts_after is None
        assert filters.starts_before is None
        assert filters.semantic_query == "tech"

    async def test_the_raw_query_is_actually_sent_to_the_model(self, mocker):
        extract_structured = patch_extract_structured(
            mocker,
            {"semantic_query": "x", "category": "NONE", "starts_after": "", "starts_before": ""},
        )

        await extract_search_filters("a very specific query string")

        prompt = extract_structured.await_args.args[0]
        assert "a very specific query string" in prompt
