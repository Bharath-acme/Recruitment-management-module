# app/utils/tasks.py
# from celery import shared_task
from app.utils.email_utils import send_email_requisition_created

# @shared_task
def send_requisition_created_email(req_id: int, position: str, created_by: str):
    """
    Async task: sends email to bharath.k@acmeglobal.tech when a new requisition is created.
    """
    recipient = ["bharath.k@acmeglobal.tech"]
    print('recipient',recipient)

    subject = f"New Requisition Created {position}"
    message = f"""
    A new requisition has been created.

    • Requisition ID: {req_id}
    • Position: {position}
    • Created By: {created_by}

    Please review the details in the RMM portal and approve .
    """
    print('requisiotn creating mail',message)
    send_email_requisition_created(recipient, subject, message)
    return True



# 1️⃣ Approval notification (approved or rejected)
# @shared_task
def send_requisition_approval_email(req_id: int, position: str, status: str, client_email: str):
    subject = f"Requisition {position} has been {status}"
    message = f"""
    Hello,

    The requisition for position **{position}** has been {status.upper()}.
    • Requisition ID: {req_id}
    • Status: {status}

    Please review details in the RMM portal.

    Regards,
    RMM System
    """
    send_email_requisition_created(client_email, subject, message)
    return True


# 2️⃣ Hiring Manager assignment email
# @shared_task
def send_hiring_manager_assigned_email(req_id: int, position: str, hm_email: str):
    subject = f"You have been assigned as Hiring Manager for {position}"
    message = f"""
    Hello,

    You have been assigned as the Hiring Manager for:

    • Position: {position}
    • Requisition ID: {req_id}

    Please log in to the RMM portal to review.
    """
    send_email_requisition_created(hm_email, subject, message)
    return True


# 3️⃣ Recruiter assignment email
# @shared_task
def send_recruiter_assigned_email(req_id: int, position: str, recruiter_email: str):
    subject = f"You have been assigned as Recruiter for {position}"
    message = f"""
    Hello,

    You have been assigned as the Recruiter for:

    • Position: {position}
    • Requisition ID: {req_id}

    Please log in to the RMM portal to begin your sourcing workflow.
    """
    send_email_requisition_created(recruiter_email, subject, message)
    return True

