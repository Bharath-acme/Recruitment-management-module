import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Dynamic Database URL Configuration ---

# 1. Fetch environment variables set in the Azure App Service Configuration
# Use .get() to safely read the environment variables.
DB_HOST = os.environ.get("AZURE_MYSQL_HOST")
DB_NAME = os.environ.get("AZURE_MYSQL_NAME")
DB_USER = os.environ.get("AZURE_MYSQL_USER")
DB_PASS = os.environ.get("AZURE_MYSQL_PASSWORD")

# Use a default port for MySQL (3306)
DB_PORT = 3306 

# 2. Construct the DATABASE_URL dynamically
# The format is: dialect+driver://user:password@host:port/database_name
# We use f-string formatting to plug in the variables.
if DB_HOST and DB_NAME and DB_USER and DB_PASS:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    # Fallback/Error handling if variables are missing (helpful for local testing too)
    print("WARNING: Database environment variables are missing. Using default localhost.")
    DATABASE_URL = "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB"


# --- SQLAlchemy Setup ---

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
