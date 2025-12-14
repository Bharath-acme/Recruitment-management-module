from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.models import Notification,Skill
from datetime import datetime
from typing import List, Optional
from sqlalchemy import func

def create_user(db: Session, user: schemas.UserCreate, hashed_pw: str):
    # 1. Check if company already exists (Case Insensitive)
    existing_company = db.query(models.Company).filter(
        func.lower(models.Company.name) == user.company.lower()
    ).first()

    if existing_company:
        # 🟢 OPTION A: Company exists -> Use its ID
        company_id = existing_company.id
        
        # Optional: You might want to auto-assign the role to 'recruiter' 
        # instead of 'admin' if they are joining an existing company.
        # role = "recruiter" 
    else:
        # 🟡 OPTION B: Company does not exist -> Create it
        new_company = models.Company(
            name=user.company,
            size=user.company_size,
            sector=user.company_sector,
            country=user.country,
            address=user.company_address,
            city=user.company_city,
            website=user.company_website,
            phone_number=user.company_phone_number
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        company_id = new_company.id
       
    # 2. Create the User linked to that company_id
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_pw,
        role=user.role, 
        company_id=company_id  # <--- Linking logic here
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).options(joinedload(models.User.company_rel)).filter(models.User.email == email).first()

def create_notification(db: Session, user_id: int, title: str, message: str):
    notif = Notification(user_id=user_id, title=title, message=message)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()



def get_skill_by_name(db: Session, name: str):
    return db.query(Skill).filter(Skill.name == name).first()

def create_skill(db: Session, skill: schemas.SkillCreate):
    db_skill = Skill(name=skill.name)
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

def get_or_create_skill(db: Session, skill_name: str) -> Skill:
    db_skill = get_skill_by_name(db, name=skill_name)
    if db_skill:
        return db_skill
    return create_skill(db, skill=schemas.SkillCreate(name=skill_name))

def search_skills(db: Session, query: str, skip: int = 0, limit: int = 100):
    return db.query(Skill).filter(Skill.name.ilike(f"%{query}%")).offset(skip).limit(limit).all()

def get_all_skills(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Skill).offset(skip).limit(limit).all()


