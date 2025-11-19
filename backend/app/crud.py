from sqlalchemy.orm import Session
from app import models, schemas
from app.models import Notification
from datetime import datetime
from typing import List, Optional

def create_user(db: Session, user: schemas.UserCreate, hashed_pw: str):
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        company=user.company,
        company_desc = user.company_desc,
        company_size = user. company_size,
        country=user.country,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_notification(db: Session, user_id: int, title: str, message: str):
    notif = Notification(user_id=user_id, title=title, message=message)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


