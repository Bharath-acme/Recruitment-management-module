from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add project directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import Base  # Import metadata from your project
from app import models 
# Import all model modules so Alembic can see them
from requisitions.models import Requisitions
from candidates.models import Candidate
from interviews.models import Interview
from offers.models import Offer
from invoices.models import Invoice

# If you have notifications:
try:
    from notifications.models import Notifications
except:
    pass
 # ensure models are imported so metadata is filled

# Alembic Config object
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# Metadata — used for autogenerate
target_metadata = Base.metadata

# Read DATABASE_URL from environment
DATABASE_URL = os.getenv("database_url")

if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)


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
            compare_type=True,      # Detect column type changes
            compare_server_default=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
