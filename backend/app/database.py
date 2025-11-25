# FILE: app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

print("DB_HOST",DB_HOST)
print("DB_USER",DB_USER)
print("DB_PASS",DB_PASS)
print("DB_NAME",DB_NAME)

LOCAL_DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB"
)

if DB_HOST and DB_USER and DB_PASS and DB_NAME:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    print(" Using remote DB:", DB_HOST)
else:
    DATABASE_URL = LOCAL_DATABASE_URL
    print(" Using local DB fallback")

print("DATABASE_URL",DATABASE_URL)
# SSL support
CONNECT_ARGS = {}
SSL_CERT = os.getenv("MYSQL_SSL_CERT")  # path to file written by startup.sh, or set directly

if SSL_CERT and os.path.exists(SSL_CERT):
    CONNECT_ARGS = {"ssl": {"ca": SSL_CERT}}
    print("🔐 SSL CA provided")
else:
    if SSL_CERT:
        print(f"⚠ MYSQL_SSL_CERT set but file not found at {SSL_CERT}. Ignoring SSL.")
    else:
        print("🔸 No SSL cert set; connecting without SSL (if allowed)")

engine = create_engine(DATABASE_URL, connect_args=CONNECT_ARGS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
