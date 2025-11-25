from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base  # metadata
# import models to ensure metadata is populated (your modules)
# e.g. from app import models
# Or explicitly import modules that define models
try:
    import app.models  # if you have models package
except Exception:
    pass

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

# Resolve DB URL (order of precedence)
DATABASE_URL = os.getenv("DATABASE_URL")  # explicit full URL (good for CI/local)
if not DATABASE_URL:
    # check component env vars used in runtime
    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASS = os.getenv("DB_PASS")
    DB_NAME = os.getenv("DB_NAME")
    DB_PORT = os.getenv("DB_PORT", "3306")

    if DB_HOST and DB_USER and DB_PASS and DB_NAME:
        DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

if not DATABASE_URL:
    # fallback to default local
    DATABASE_URL = "mysql+pymysql://root:acmeglobal@localhost:3306/recruitementDB"

config.set_main_option("sqlalchemy.url", DATABASE_URL)
print("alembic using DATABASE_URL:", DATABASE_URL)


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
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
