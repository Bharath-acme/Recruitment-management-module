# FILE: app/database.py
"""
Database connection with optional SSL and safe defaults.
Keep certificate file beside app/database.py if required by your Azure MySQL instance.
"""
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
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    CERT_FILENAME = os.environ.get("MYSQL_SSL_CERT", "certificate")
    SSL_CA_PATH = os.path.join(os.path.dirname(__file__), CERT_FILENAME)

    CONNECT_ARGS = {}
    # Attach SSL CA only if the certificate file exists
    if os.path.exists(SSL_CA_PATH):
        CONNECT_ARGS = {
            'ssl': {
                'ca': SSL_CA_PATH
            }
        }
    else:
        # If cert not found, fall back to non-ssl connection but log a warning.
        print(f"WARNING: SSL certificate not found at {SSL_CA_PATH}. Continuing without SSL connect_args.")

else:
    print("WARNING: Database environment variables are missing. Using default localhost for dev.")
    DATABASE_URL = os.environ.get("DATABASE_URL", "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB")
    CONNECT_ARGS = {}

# --- SQLAlchemy Setup ---
engine = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()