#!/bin/bash

echo "🚀 Starting backend..."

# Move into site directory (Azure extracts app into /tmp/... and symlinks here)
cd /home/site/wwwroot || cd /tmp/*

# Make sure script stops on errors
set -e

# Azure/Oryx automatically creates the virtual environment "antenv"
if [ -d "antenv/bin" ]; then
    echo "📦 Activating Oryx virtual environment..."
    source antenv/bin/activate
else
    echo "❌ ERROR: Virtual environment 'antenv' not found!"
    ls -al
fi

echo "🔧 Running Alembic migrations..."

# Ensure Alembic sees the correct environment variables
export PYTHONPATH=/home/site/wwwroot:$PYTHONPATH

# Run migrations safely
alembic upgrade head || echo "⚠ Alembic failed, but continuing startup..."

echo "🔥 Starting FastAPI with Gunicorn..."

exec gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
