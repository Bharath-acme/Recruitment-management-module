#!/bin/bash

echo "🚀 Starting backend..."

cd "$(dirname "$0")"
source antenv/bin/activate

export PYTHONPATH=/home/site/wwwroot/backend

echo "🔧 Running Alembic migrations..."
alembic upgrade head || echo "⚠ Alembic failed, continuing..."

# echo "🔥 Starting Celery worker..."
# celery -A app.celery_worker.celery_app worker --loglevel=info &

echo "🔥 Starting FastAPI with Gunicorn..."
exec gunicorn app.main:app \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:${PORT:-8000}
