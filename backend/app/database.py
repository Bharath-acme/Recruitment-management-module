import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Dynamic Database URL Configuration ---

# 1. Fetch environment variables set in the Azure App Service Configuration
DB_HOST = os.environ.get("AZURE_MYSQL_HOST")
DB_NAME = os.environ.get("AZURE_MYSQL_NAME")
DB_USER = os.environ.get("AZURE_MYSQL_USER")
DB_PASS = os.environ.get("AZURE_MYSQL_PASSWORD")

# Use a default port for MySQL (3306)
DB_PORT = 3306 

# 2. Construct the DATABASE_URL dynamically
if DB_HOST and DB_NAME and DB_USER and DB_PASS:
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # --- SSL Configuration (Required by Azure MySQL) ---
    
    # Since 'certificate' is in the same directory as database.py (inside 'app'),
    # we can construct the absolute path relative to the current file (__file__).
    # If the file name is 'certificate' (as shown in your screenshot):
    CERT_FILENAME = "certificate" 
    
    # We use os.path.dirname(__file__) to get the directory of database.py ('app/')
    # and then join the certificate filename.
    SSL_CA_PATH = os.path.join(os.path.dirname(__file__), CERT_FILENAME)
    
    # Create the connection arguments dictionary
    CONNECT_ARGS = {
        'ssl': {
            # 'ca' expects the path to the root certificate file
            'ca': SSL_CA_PATH
        }
    }
    print(f"DEBUG: Using SSL CA Path: {SSL_CA_PATH}")

else:
    # Fallback for local testing (no SSL needed, no connect_args)
    print("WARNING: Database environment variables are missing. Using default localhost.")
    DATABASE_URL = "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB"
    CONNECT_ARGS = {} # Empty args for local connection


# --- SQLAlchemy Setup ---

# Pass the SSL arguments (CONNECT_ARGS) to the engine
engine = create_engine(
    DATABASE_URL,
    connect_args=CONNECT_ARGS # <-- This is the key change to enable SSL
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
