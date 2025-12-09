from celery import Celery
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# IMPORTANT: Load models before Celery starts
from app.models import User, Notification
from requisitions.models import Requisitions
from candidates.models import Candidate
from interviews.models import Interview
from offers.models import Offer

celery_app = Celery(
    "recruitment_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.utils.notifier"]    # ensure tasks are imported
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

celery_app.autodiscover_tasks([
    "app.utils",
    "app.tasks"
])
