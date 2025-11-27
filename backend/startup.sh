#!/bin/bash

echo "🚀 Starting backend..."

# Move into backend folder
cd "$(dirname "$0")"

# Activate virtual environment created by Azure/Oryx
source antenv/bin/activate

# For Python imports (so app/ is recognized)
export PYTHONPATH=/home/site/wwwroot/backend

echo "🔧 Running Alembic migrations..."
alembic upgrade head || echo "⚠ Alembic failed, continuing..."

echo "🔥 Starting FastAPI with Gunicorn..."
exec gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
