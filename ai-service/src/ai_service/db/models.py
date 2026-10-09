import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from ai_service.embeddings.constants import EMBEDDING_DIMENSIONS


class Base(DeclarativeBase):
    pass


class PollEmbedding(Base):
    """One row per poll, indexed from poll.created. Polls have no update/delete
    RPC in polls.proto, so this table is write-once per poll_id."""

    __tablename__ = "poll_embeddings"

    poll_id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    starts_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_votes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    embedding: Mapped[list[float]] = mapped_column(Vector(EMBEDDING_DIMENSIONS), nullable=False)
    indexed_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False)
