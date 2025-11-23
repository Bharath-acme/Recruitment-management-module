#!/bin/bash

echo "🔄 Running Alembic migrations..."
alembic upgrade head || echo "⚠ Alembic migration failed — continuing startup"

echo "🚀 Starting FastAPI (Gunicorn + Uvicorn Worker)..."
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
