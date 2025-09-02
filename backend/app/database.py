from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# -------------------------------------------------------------------
# Database Connection
# Creates SQLAlchemy engine + session factory from DATABASE_URL.
# Provides get_db() dependency for FastAPI routes.
# -------------------------------------------------------------------

# Load environment variables (from .env file)
load_dotenv()

# Database connection string (e.g., Postgres on DigitalOcean)
DATABASE_URL = os.environ.get("DATABASE_URL")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Session factory — generates DB sessions for requests
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency that yields a database session.

    Usage:
        db: Session = Depends(get_db)

    Ensures the session is closed after the request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
