import os
import sys
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context
from app import models  # loads main models
# Import Base + DATABASE_URL from your app
from app.database import Base, DATABASE_URL

sys.path.append("/home/site/wwwroot/backend")

config = context.config

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Enable autogenerate from models
target_metadata = Base.metadata


def is_azure_environment():
    """
    Detect if running on Azure App Service.
    Azure automatically sets this env variable.
    """
    return "WEBSITE_SITE_NAME" in os.environ


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode'."""

    # SSL only for Azure
    if is_azure_environment():
        connect_args = {"ssl": {"ca": "/etc/ssl/certs/ca-certificates.crt"}}
    else:
        connect_args = {}  # local: NO SSL

    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=pool.NullPool,
    )

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


# RUN MIGRATIONS
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
