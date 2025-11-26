#!/bin/bash

echo "🚀 Starting backend..."

# Activate virtual environment created by Azure/Oryx
source antenv/bin/activate

echo "🔧 Running Alembic migrations..."
alembic upgrade head || echo "⚠ Alembic failed, continuing..."

echo "🔥 Starting FastAPI with Gunicorn..."
exec gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
