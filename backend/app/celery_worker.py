import os
from celery import Celery

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PORT = os.getenv("REDIS_PORT", "6380")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
REDIS_DB = os.getenv("REDIS_DB", "0")

REDIS_URL = (
    f"rediss://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
)

celery_app = Celery(
    "rmm",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    broker_connection_retry_on_startup=True,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
)
