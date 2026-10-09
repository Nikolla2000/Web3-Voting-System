import datetime
import json
import logging

import aio_pika
from sqlalchemy.dialects.postgresql import insert

from ai_service.config.settings import settings
from ai_service.db.models import PollEmbedding
from ai_service.db.session import async_session
from ai_service.embeddings.voyage_client import embed_document
from ai_service.events.rabbitmq_constants import RABBITMQ_EXCHANGE, ROUTING_KEY_POLL_CREATED

logger = logging.getLogger(__name__)

QUEUE_NAME = "ai.poll-index"


async def _handle_poll_created(message: aio_pika.abc.AbstractIncomingMessage) -> None:
    async with message.process(ignore_processed=True):
        event = json.loads(message.body)
        poll_id = event["pollId"]

        embedding = await embed_document(f"{event['title']}\n\n{event['description']}")

        async with async_session() as session:
            await session.execute(
                insert(PollEmbedding)
                .values(
                    poll_id=poll_id,
                    title=event["title"],
                    description=event["description"],
                    category=event["category"],
                    starts_at=datetime.datetime.fromisoformat(event["startsAt"]),
                    ends_at=datetime.datetime.fromisoformat(event["endsAt"]),
                    total_votes=0,
                    embedding=embedding,
                    indexed_at=datetime.datetime.now(datetime.timezone.utc),
                )
                .on_conflict_do_nothing(index_elements=["poll_id"])
            )
            await session.commit()

        logger.info("Indexed poll %s", poll_id)


async def start_poll_created_consumer(connection: aio_pika.abc.AbstractConnection) -> None:
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=10)

    exchange = await channel.declare_exchange(RABBITMQ_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True)
    queue = await channel.declare_queue(QUEUE_NAME, durable=True)
    await queue.bind(exchange, routing_key=ROUTING_KEY_POLL_CREATED)

    await queue.consume(_handle_poll_created)
    logger.info("Consuming [%s] -> queue '%s'", ROUTING_KEY_POLL_CREATED, QUEUE_NAME)
