# app/utils/tasks.py
from celery import shared_task
from app.utils.email_utils import send_email_requisition_created

@shared_task
def send_requisition_created_email(req_id: int, position: str, created_by: str):
    """
    Async task: sends email to bharath.k@acmeglobal.tech when a new requisition is created.
    """
    recipient = "bharath.k@acmeglobal.tech"

    subject = f"New Requisition Created {position}"
    message = f"""
    A new requisition has been created.

    • Requisition ID: {req_id}
    • Position: {position}
    • Created By: {created_by}

    Please review the details in the RMM portal and approve .
    """
    print(message)
    send_email_requisition_created(recipient, subject, message)
    return True
