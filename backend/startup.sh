#!/usr/bin/env bash
set -euo pipefail

echo "----------------------------------------"
echo "Startup - Alembic migrations + Gunicorn"
echo "----------------------------------------"

# If MYSQL_SSL_CERT_CONTENT is set (base64 or raw), write to file
if [ -n "${MYSQL_SSL_CERT_CONTENT-}" ]; then
  echo "Writing MYSQL SSL cert to disk..."
  # try to decode if it's base64; if decode fails we'll fallback to raw write
  DEST="/home/site/wwwroot/app/mysql_ca.pem"
  if echo "${MYSQL_SSL_CERT_CONTENT}" | base64 --decode >/dev/null 2>&1; then
    echo "${MYSQL_SSL_CERT_CONTENT}" | base64 --decode > "${DEST}"
  else
    echo "${MYSQL_SSL_CERT_CONTENT}" > "${DEST}"
  fi
  export MYSQL_SSL_CERT="${DEST}"
  echo "SSL cert written to ${DEST}"
fi

# Optionally: print DB env (masked lightly)
echo "DB_HOST=${DB_HOST:-(not set)}"
echo "DB_NAME=${DB_NAME:-(not set)}"
echo "DB_USER=${DB_USER:-(not set)}"

# run alembic (failure won't stop server; adjust if you want strict)
echo "Running Alembic migrations..."
alembic upgrade head || echo "⚠ Alembic migration failed — continuing startup"

# Start Gunicorn + Uvicorn workers
echo "Starting Gunicorn + Uvicorn..."
exec gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
