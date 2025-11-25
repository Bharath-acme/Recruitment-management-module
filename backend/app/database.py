# FILE: app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- Dynamic Database URL Configuration ---
DB_HOST = os.environ.get("AZURE_MYSQL_HOST")
DB_NAME = os.environ.get("AZURE_MYSQL_NAME")
DB_USER = os.environ.get("AZURE_MYSQL_USER")
DB_PASS = os.environ.get("AZURE_MYSQL_PASSWORD")
DB_PORT = int(os.environ.get("AZURE_MYSQL_PORT", 3306))

if DB_HOST and DB_NAME and DB_USER and DB_PASS:
    # ALWAYS force SSL on Azure MySQL
    DATABASE_URL = (
        f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        "?ssl-mode=REQUIRED"
    )
    CONNECT_ARGS = {}
else:
    print("WARNING: Database environment variables missing → using localhost for dev.")
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB"
    )
    CONNECT_ARGS = {}

# --- SQLAlchemy Engine (Azure Compatible) ---
engine = create_engine(
    DATABASE_URL,
    connect_args=CONNECT_ARGS,
    pool_pre_ping=True,     # Fixes “MySQL server has gone away”
    pool_recycle=280,       # Azure resets idle connections every 300 seconds
    pool_timeout=30,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
