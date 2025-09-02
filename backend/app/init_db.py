from app.models import Base
from app.database import engine

# -------------------------------------------------------------------
# Database Initialization Script
# Creates all database tables defined in app.models.Base metadata.
# Typically run once during setup or deployment to ensure schema exists.
# -------------------------------------------------------------------

print("Initializing the database...")

# Create all tables (no-op if tables already exist)
Base.metadata.create_all(bind=engine)

print("Database initialized successfully.")
