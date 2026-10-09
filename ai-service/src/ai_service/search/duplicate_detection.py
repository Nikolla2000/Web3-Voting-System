from sqlalchemy import select

from ai_service.db.models import PollEmbedding
from ai_service.db.session import async_session
from ai_service.embeddings.voyage_client import embed_query
from ai_service.search.constants import DUPLICATE_CHECK_SIMILARITY_THRESHOLD, DUPLICATE_CHECK_TOP_K


async def find_similar_polls(title: str, description: str) -> list[dict]:
    query_embedding = await embed_query(f"{title}\n\n{description}")

    distance = PollEmbedding.embedding.cosine_distance(query_embedding)
    stmt = (
        select(PollEmbedding.poll_id, PollEmbedding.title, distance.label("distance"))
        .order_by(distance)
        .limit(DUPLICATE_CHECK_TOP_K)
    )

    async with async_session() as session:
        rows = (await session.execute(stmt)).all()

    matches = [
        {"poll_id": row.poll_id, "title": row.title, "similarity": 1 - row.distance}
        for row in rows
    ]
    return [m for m in matches if m["similarity"] >= DUPLICATE_CHECK_SIMILARITY_THRESHOLD]
