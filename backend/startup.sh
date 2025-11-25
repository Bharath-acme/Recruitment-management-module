#!/bin/bash
set -e

echo "Generating SQLAlchemy DATABASE_URL for Alembic....."

export DATABASE_URL="mysql+pymysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?ssl_ca=/etc/ssl/certs/BaltimoreCyberTrustRoot.crt.pem"

echo "DATABASE_URL set to: $DATABASE_URL"

echo "Running Alembic migrations..."
alembic upgrade head || echo "⚠ Alembic migration failed — continuing startup"

echo "Starting FastAPI server..."
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind=0.0.0.0:8000
