# app/utils/notifier.py
from app.celery_worker import celery_app
from app.database import SessionLocal
from app.models import User, Notification
from requisitions.models import Requisitions
from app.utils.mailer import send_email
from typing import List

@celery_app.task
def send_requisition_for_approval(requisition_id: int, creator_id: int):
    """
    Called right after a requisition is created.
    - Notifies the Hiring Manager (if present) and the Client (if present) to review/approve.
    """
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        if not req:
            return

        creator = db.query(User).filter(User.id == creator_id).first()

        # Gather HM and client recipients (defensive: check several possible fields)
        recipients_emails: List[str] = []
        recipient_users: List[User] = []

        # Hiring manager (if stored as hiring_manager_id)
        if getattr(req, "hiring_manager_id", None):
            hm = db.query(User).filter(User.id == req.hiring_manager_id).first()
            if hm:
                recipients_emails.append(hm.email)
                recipient_users.append(hm)

        # Client: try client_email or client_id
        client_email = getattr(req, "client_email", None)
        client_id = getattr(req, "client_id", None)
        if client_email:
            recipients_emails.append(client_email)
        elif client_id:
            client = db.query(User).filter(User.id == client_id).first()
            if client:
                recipients_emails.append(client.email)
                recipient_users.append(client)

        # fallback: if no HM/client found, notify creator only
        if not recipients_emails and creator:
            recipients_emails = [creator.email]
            recipient_users = [creator]

        subject = f"Requisition Approval Required: {req.position}"
        body = f"Requisition '{req.position}' has been created and requires approval."

        # send email
        if recipients_emails:
            send_email(recipients_emails, subject, body)

        # create notifications for each user entity we found (or for creator as fallback)
        if recipient_users:
            for u in recipient_users:
                notif = Notification(
                    user_id=u.id,
                    title=subject,
                    message=body,
                    requisition_id=requisition_id,
                    type="approval_request"
                )
                db.add(notif)
        else:
            # create a notification for creator if nobody else exists
            if creator:
                notif = Notification(
                    user_id=creator.id,
                    title=subject,
                    message=body,
                    requisition_id=requisition_id,
                    type="approval_request"
                )
                db.add(notif)

        db.commit()

        send_notification_ws(u.id, {
            "id": notif.id,
            "title": subject,
            "message": body,
            "requisition_id": requisition_id,
            "type": "approval_request",
            "created_at": str(notif.created_at)
        })

    finally:
        db.close()


@celery_app.task
def send_requisition_approval_update(requisition_id: int, updater_id: int):
    """
    Notify relevant parties after approval status changes.
    Notifies: Hiring Manager (if exists), Client (if exists), and the updater (who performed the action).
    """
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        if not req:
            return

        updater = db.query(User).filter(User.id == updater_id).first()

        # Build recipients list and user objects
        recipients_emails = []
        recipient_users = []

        # Hiring manager
        if getattr(req, "hiring_manager_id", None):
            hm = db.query(User).filter(User.id == req.hiring_manager_id).first()
            if hm:
                recipients_emails.append(hm.email)
                recipient_users.append(hm)

        # Client
        client_email = getattr(req, "client_email", None)
        client_id = getattr(req, "client_id", None)
        if client_email:
            recipients_emails.append(client_email)
        elif client_id:
            client = db.query(User).filter(User.id == client_id).first()
            if client:
                recipients_emails.append(client.email)
                recipient_users.append(client)

        # Also include the updater so they get confirmation
        if updater and updater.email not in recipients_emails:
            recipients_emails.append(updater.email)
            recipient_users.append(updater)

        subject = f"Requisition Approval Updated: {req.position}"
        body = f"Requisition '{req.position}' approval status updated to '{req.approval_status}'."

        if recipients_emails:
            send_email(recipients_emails, subject, body)

        # create notifications for recipients that are users in the system
        for u in recipient_users:
            notif = Notification(
                user_id=u.id,
                title=subject,
                message=body,
                requisition_id=requisition_id,
                type="approval_updated"
            )
            db.add(notif)

        db.commit()

        send_notification_ws(u.id, {
            "id": notif.id,
            "title": subject,
            "message": body,
            "requisition_id": requisition_id,
            "type": "approval_updated",
            "created_at": str(notif.created_at)
        })

    finally:
        db.close()


@celery_app.task
def send_requisition_deleted(requisition_id: int):
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        if not req:
            return

        subject = f"Requisition Deleted: {req.position}"
        body = f"Requisition '{req.position}' has been deleted."

        # Assuming recruiter_id points to a user (keeps your original behavior)
        recruiters = []
        if getattr(req, "recruiter_id", None):
            recruiters = db.query(User).filter(User.id == req.recruiter_id).all()

        recipients = [rec.email for rec in recruiters if rec and rec.email]

        if recipients:
            send_email(recipients, subject, body)

        for rec in recruiters:
            notif = Notification(
                user_id=rec.id,
                title=subject,
                message=body,
                requisition_id=requisition_id,
                type="requisition_deleted"
            )
            db.add(notif)
        db.commit()
    finally:
        db.close()


@celery_app.task
def send_team_assignment_notification(requisition_id: int, recruiter_id: int):
    """
    Notifies recruiter and hiring manager when a recruiter is assigned to a requisition.
    """
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        recruiter = db.query(User).filter(User.id == recruiter_id).first() if recruiter_id else None

        if not req or not recruiter:
            return

        recipients = [recruiter.email] if recruiter.email else []

        # Also notify HM if present
        hm = None
        if getattr(req, "hiring_manager_id", None):
            hm = db.query(User).filter(User.id == req.hiring_manager_id).first()
            if hm and hm.email:
                recipients.append(hm.email)

        subject = f"Assigned to Requisition: {req.position}"
        body = f"You have been assigned to the requisition '{req.position}'."

        if recipients:
            send_email(recipients, subject, body)

        # create notifications for recruiter
        notif_rec = Notification(
            user_id=recruiter.id,
            title=subject,
            message=body,
            requisition_id=requisition_id,
            type="team_assignment"
        )
        db.add(notif_rec)
        

        # notification for HM if exists
        if hm:
            notif_hm = Notification(
                user_id=hm.id,
                title=f"Recruiter Assigned for: {req.position}",
                message=f"{recruiter.name} has been assigned to requisition '{req.position}'.",
                requisition_id=requisition_id,
                type="recruiter_assigned"
            )
            db.add(notif_hm)

        db.commit()
        send_notification_ws(recruiter.id, {
            "id": notif_rec.id,
            "title": notif_rec.title,
            "message": notif_rec.message,
            "requisition_id": requisition_id,
            "type": notif_rec.type,
            "created_at": str(notif_rec.created_at)
        })
    finally:
        db.close()
