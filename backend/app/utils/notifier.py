from app.celery_worker import celery_app
from app.database import SessionLocal
from app.models import  User, Notification
from requisitions.models import Requisitions
from app.utils.mailer import send_email

@celery_app.task
def send_requisition_created(requisition_id: int, creator_id: int):
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        if not req:
            return

        creator = db.query(User).filter(User.id == creator_id).first()
        recipients = [creator.email] if creator else []

        subject = f"Requisition Created: {req.position}"
        body = f"Requisition '{req.position}' created successfully."

        send_email(recipients, subject, body)

        notif = Notification(
            user_id=creator_id,
            title=subject,
            message=body,
            requisition_id=requisition_id,
            type="requisition_created"
        )
        db.add(notif)
        db.commit()
    finally:
        db.close()

@celery_app.task
def send_requisition_approval_update(requisition_id: int, updater_id: int):
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        if not req:
            return

        updater = db.query(User).filter(User.id == updater_id).first()
        recipients = [updater.email] if updater else []

        subject = f"Requisition Approval Updated: {req.position}"
        body = f"Requisition '{req.position}' approval status updated to '{req.approval_status}'."

        send_email(recipients, subject, body)

        notif = Notification(
            user_id=updater_id,
            title=subject,
            message=body,
            requisition_id=requisition_id,
            type="approval_updated"
        )
        db.add(notif)
        db.commit()
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

        # Assuming we notify all recruiters associated with the requisition
        recruiters = db.query(User).filter(User.id == req.recruiter_id).all()
        recipients = [rec.email for rec in recruiters]

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
    db = SessionLocal()
    try:
        req = db.query(Requisitions).filter(Requisitions.id == requisition_id).first()
        recruiter = db.query(User).filter(User.id == recruiter_id).first()
        if not req or not recruiter:
            return

        subject = f"Assigned to Requisition: {req.position}"
        body = f"You have been assigned to the requisition '{req.position}'."

        send_email([recruiter.email], subject, body)

        notif = Notification(
            user_id=recruiter_id,
            title=subject,
            message=body,
            requisition_id=requisition_id,
            type="team_assignment"
        )
        db.add(notif)
        db.commit()
    finally:
        db.close()
