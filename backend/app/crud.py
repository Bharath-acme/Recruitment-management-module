from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from typing import List, Optional

def create_user(db: Session, user: schemas.UserCreate, hashed_pw: str):
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        company=user.company,
        country=user.country,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


