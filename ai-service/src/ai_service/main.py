import asyncio
import logging

import aio_pika
from grpclib.server import Server

from ai_service.ai_servicer import AiServicer
from ai_service.config.settings import settings
from ai_service.events.poll_created_consumer import start_poll_created_consumer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _run() -> None:
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    await start_poll_created_consumer(connection)

    server = Server([AiServicer()])
    await server.start("0.0.0.0", settings.ai_service_port)
    logger.info("gRPC server listening on :%d", settings.ai_service_port)

    await server.wait_closed()


def main() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    main()
