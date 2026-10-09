from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from ai_service.config.settings import settings

engine = create_async_engine(settings.database_url)
async_session = async_sessionmaker(engine, expire_on_commit=False)
