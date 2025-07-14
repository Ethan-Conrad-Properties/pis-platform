from app.models import Base
from app.database import engine

print("Initializing the database...")
Base.metadata.create_all(bind=engine)
print("Database initialized successfully.")