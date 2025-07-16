from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:ecwBnCLR8k8p2kMB@db.gchpvrarrsoxwsijolko.supabase.co:5432/postgres"  

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)