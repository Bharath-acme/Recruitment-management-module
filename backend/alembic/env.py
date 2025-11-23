import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Add project root to PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import Base and all models
from app.database import Base  
from app import models  # DO NOT REMOVE – ensures models load

from requisitions.models import Requisitions
from candidates.models import Candidate
from interviews.models import Interview
from offers.models import Offer
from invoices.models import Invoice

try:
    from notifications.models import Notifications
except:
    pass

# Alembic Config
config = context.config

# Logging
fileConfig(config.config_file_name)

# Target metadata for autogenerate
target_metadata = Base.metadata

# -----------------------------------------------------------
#   DATABASE URL LOGIC (Production + Local)
# -----------------------------------------------------------

# Azure App Service → App Settings
azure_host = os.getenv("AZURE_MYSQL_HOST")
azure_user = os.getenv("AZURE_MYSQL_USER")
azure_password = os.getenv("AZURE_MYSQL_PASSWORD")
azure_db = os.getenv("AZURE_MYSQL_DB")

DATABASE_URL = None

# Azure - If all 4 exist, build production connection string
if azure_host and azure_user and azure_password and azure_db:
    DATABASE_URL = (
        f"mysql+pymysql://{azure_user}:{azure_password}@{azure_host}:3306/{azure_db}"
    )

# Local fallback (when running on localhost)
if not DATABASE_URL:
    DATABASE_URL = "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB"

# Inject into Alembic runtime
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# -----------------------------------------------------------
#   Alembic Migration Runners
# -----------------------------------------------------------

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # detect column type changes
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
