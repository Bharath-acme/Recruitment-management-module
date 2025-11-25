from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Add project directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base

from app import models
from requisitions.models import Requisitions
from candidates.models import Candidate
from interviews.models import Interview
from offers.models import Offer
from invoices.models import Invoice

try:
    from notifications.models import Notifications
except:
    pass

config = context.config
fileConfig(config.config_file_name)

target_metadata = Base.metadata

# -----------------------------
# BUILD DATABASE_URL HERE
# -----------------------------
AZ_HOST = os.getenv("AZURE_MYSQL_HOST")
AZ_USER = os.getenv("AZURE_MYSQL_USER")
AZ_PASS = os.getenv("AZURE_MYSQL_PASSWORD")
AZ_DB   = os.getenv("AZURE_MYSQL_DB")
AZ_PORT = os.getenv("AZURE_MYSQL_PORT", "3306")

if AZ_HOST and AZ_USER and AZ_PASS and AZ_DB:
    DATABASE_URL = (
        f"mysql+pymysql://{AZ_USER}:{AZ_PASS}@{AZ_HOST}:{AZ_PORT}/{AZ_DB}"
    )
    print("✔ Using Azure MySQL URL")
else:
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB",
    )
    print("✔ Using LOCAL database URL")

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
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
