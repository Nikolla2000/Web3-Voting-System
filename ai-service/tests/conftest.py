"""
Several modules (ai_service.config.settings, ai_service.llm.gemini_client,
ai_service.embeddings.voyage_client) construct real settings/API clients as
module-level singletons at *import* time — Settings() validates required
env vars immediately, and genai.Client()/voyageai.AsyncClient() are built
right there too. That means simply importing a module under test can fail
(or, worse, silently construct a client against whatever real .env happens
to be on disk) unless these env vars are already set first.

pydantic-settings gives real process env vars precedence over the .env
file, so setting dummy values here before any ai_service import runs makes
every test deterministic and independent of the local .env's contents —
no real API key or database ever needs to be present to run the unit
tests in this directory.
"""

import os

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost/test")
os.environ.setdefault("RABBITMQ_URL", "amqp://test:test@localhost/")
os.environ.setdefault("VOYAGE_API_KEY", "test-voyage-key")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
