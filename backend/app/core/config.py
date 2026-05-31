from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL connection string",
    )
    JWT_SECRET: str = Field(
        ...,
        description="Secret key for signing JWT tokens",
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="Algorithm used for JWT encoding",
    )
    JWT_EXPIRE_MINUTES: int = Field(
        default=60,
        description="Token expiration time in minutes",
    )
    GROQ_API_KEY: str | None = Field(
        default=None,
        description="Optional Groq API key for AI safety copilot",
    )
    ADMIN_BOOTSTRAP_ENABLED: bool = Field(
        default=False,
        description="Enable one-time admin bootstrap on startup",
    )
    ADMIN_BOOTSTRAP_NAME: str | None = Field(
        default=None,
        description="Admin name used during bootstrap",
    )
    ADMIN_BOOTSTRAP_EMAIL: str | None = Field(
        default=None,
        description="Admin email used during bootstrap",
    )
    ADMIN_BOOTSTRAP_PASSWORD: str | None = Field(
        default=None,
        description="Admin password used during bootstrap",
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton settings instance used throughout the application
settings = Settings()
