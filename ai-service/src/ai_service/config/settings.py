from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    rabbitmq_url: str
    voyage_api_key: str
    gemini_api_key: str
    ai_service_port: int = 3004
    polls_service_host: str = "127.0.0.1"


settings = Settings()
