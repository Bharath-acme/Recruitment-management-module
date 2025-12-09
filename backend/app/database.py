import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# -----------------------------------
# Detect Azure App Service
# -----------------------------------
def is_azure_environment():
    return "WEBSITE_SITE_NAME" in os.environ


# -----------------------------------
# LOCAL DATABASE (fallback)
# -----------------------------------
LOCAL_DB_URL = "mysql+pymysql://root:acmeglobal@localhost:3306/acmeglobal"


# -----------------------------------
# Azure Database Settings (from App Settings)
# -----------------------------------
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = os.getenv("DB_PORT", "3306")

# Build Azure URL only if all env vars exist
if DB_HOST and DB_USER and DB_PASS and DB_NAME:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    # Use local DB fallback
    DATABASE_URL = LOCAL_DB_URL


# -----------------------------------
# SSL config only for Azure
# -----------------------------------
if is_azure_environment():
    connect_args = {"ssl": {"ca": "/etc/ssl/certs/ca-certificates.crt"}}
else:
    connect_args = {}  # no SSL locally


# -----------------------------------
# Create Engine
# -----------------------------------
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# -----------------------------------
# FastAPI Dependency
# -----------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
