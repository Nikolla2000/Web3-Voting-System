import datetime

from sqlalchemy import select

from ai_service.db.models import PollEmbedding
from ai_service.db.session import async_session
from ai_service.embeddings.voyage_client import embed_query
from ai_service.search.constants import SEARCH_TOP_K
from ai_service.search.query_parser import extract_search_filters


async def search_polls(query: str) -> list[dict]:
    filters = await extract_search_filters(query)
    has_topic = bool(filters.semantic_query.strip())

    filter_clauses = []
    if filters.category:
        filter_clauses.append(PollEmbedding.category == filters.category)
    if filters.starts_after:
        filter_clauses.append(PollEmbedding.starts_at >= _start_of_day(filters.starts_after))
    if filters.starts_before:
        filter_clauses.append(PollEmbedding.starts_at <= _end_of_day(filters.starts_before))

    async with async_session() as session:
        if has_topic:
            query_embedding = await embed_query(filters.semantic_query)
            distance = PollEmbedding.embedding.cosine_distance(query_embedding)
            stmt = (
                select(PollEmbedding.poll_id, distance.label("distance"))
                .where(*filter_clauses)
                .order_by(distance)
                .limit(SEARCH_TOP_K)
            )
            rows = (await session.execute(stmt)).all()
            return [{"poll_id": row.poll_id, "similarity": 1 - row.distance} for row in rows]

        # A pure filter query (e.g. "society polls starting in October") with
        # no topic left to rank by similarity -- order by recency instead of
        # embedding an empty string.
        stmt = (
            select(PollEmbedding.poll_id)
            .where(*filter_clauses)
            .order_by(PollEmbedding.starts_at.desc())
            .limit(SEARCH_TOP_K)
        )
        rows = (await session.execute(stmt)).all()
        return [{"poll_id": row.poll_id, "similarity": 1.0} for row in rows]


def _start_of_day(d: datetime.date) -> datetime.datetime:
    return datetime.datetime.combine(d, datetime.time.min, tzinfo=datetime.timezone.utc)


def _end_of_day(d: datetime.date) -> datetime.datetime:
    return datetime.datetime.combine(d, datetime.time.max, tzinfo=datetime.timezone.utc)
