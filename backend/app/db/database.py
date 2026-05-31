from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLAlchemy engine connected to PostgreSQL
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections are alive before using them
    pool_size=10,
    max_overflow=20,
)

# Session factory — each request gets its own session via the get_db dependency
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base class for all ORM models
Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session per request.

    Ensures the session is closed after the request completes,
    even if an exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
