import voyageai

from ai_service.config.settings import settings
from ai_service.embeddings.constants import VOYAGE_EMBEDDING_MODEL

_client = voyageai.AsyncClient(api_key=settings.voyage_api_key)


async def embed_document(text: str) -> list[float]:
    result = await _client.embed([text], model=VOYAGE_EMBEDDING_MODEL, input_type="document")
    return result.embeddings[0]


async def embed_query(text: str) -> list[float]:
    result = await _client.embed([text], model=VOYAGE_EMBEDDING_MODEL, input_type="query")
    return result.embeddings[0]
