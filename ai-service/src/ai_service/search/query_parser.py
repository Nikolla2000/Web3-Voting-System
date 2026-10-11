import datetime
from dataclasses import dataclass

from ai_service.db.poll_category import POLL_CATEGORIES
from ai_service.llm.gemini_client import extract_structured

# Gemini's response_json_schema subset has limited/undocumented nullable
# support ("nullable properties are not sufficient" per the SDK docs), so
# "not specified" is modeled with sentinel strings instead of JSON null.
_NO_CATEGORY = "NONE"

_FILTER_SCHEMA = {
    "type": "object",
    "properties": {
        "semantic_query": {
            "type": "string",
            "description": "The core topic to search for, with any date range or category already captured below removed.",
        },
        "category": {
            "type": "string",
            "enum": [*POLL_CATEGORIES, _NO_CATEGORY],
            "description": (
                "One of the listed categories, ONLY if the query explicitly names that category or a direct "
                f"synonym of it (e.g. 'politics polls', 'sports polls'). Otherwise {_NO_CATEGORY} -- never infer "
                "a category from a general topic word alone (e.g. a query about 'climate' is NOT evidence of "
                "TECH_SCIENCE or SOCIETY; leave category as NONE and let the topic be handled by semantic_query)."
            ),
        },
        "starts_after": {
            "type": "string",
            "description": "ISO 8601 date (YYYY-MM-DD), inclusive lower bound on the poll's start date, otherwise an empty string.",
        },
        "starts_before": {
            "type": "string",
            "description": "ISO 8601 date (YYYY-MM-DD), inclusive upper bound on the poll's start date, otherwise an empty string.",
        },
    },
    "required": ["semantic_query", "category", "starts_after", "starts_before"],
}


@dataclass
class SearchFilters:
    semantic_query: str
    category: str | None
    starts_after: datetime.date | None
    starts_before: datetime.date | None


async def extract_search_filters(query: str) -> SearchFilters:
    today = datetime.date.today().isoformat()
    prompt = f'Today\'s date is {today}. Extract search filters from this poll search query: "{query}"'

    data = await extract_structured(prompt, _FILTER_SCHEMA)

    category = data.get("category")
    return SearchFilters(
        semantic_query=data["semantic_query"],
        category=None if category == _NO_CATEGORY else category,
        starts_after=_parse_date(data.get("starts_after")),
        starts_before=_parse_date(data.get("starts_before")),
    )


def _parse_date(value: str | None) -> datetime.date | None:
    return datetime.date.fromisoformat(value) if value else None
