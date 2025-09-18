from sqlalchemy.orm import Session
from app import models, schemas
import uuid
from app.auth import hash_password
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



def create_requisition(db: Session, req: schemas.RequisitionCreate):
    db_req = models.Requisitions(**req.dict())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req


def get_requisition(db: Session, requisition_id: int):
    return db.query(models.Requisitions).filter(models.Requisitions.id == requisition_id).first()


def get_requisitions(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Requisitions).offset(skip).limit(limit).all()


def update_requisition(db: Session, requisition_id: int, req: schemas.RequisitionUpdate, recruiter_id: Optional[int] = None):
    db_req = db.query(models.Requisitions).filter(models.Requisitions.id == requisition_id).first()
    if not db_req:
        return None

    # Update fields from schema
    for key, value in req.dict(exclude_unset=True).items():
        setattr(db_req, key, value)

    # Update the recruiter if provided
    if recruiter_id is not None:
        db_req.recruiter_id = recruiter_id

    db.commit()
    db.refresh(db_req)
    return db_req


def delete_requisition(db: Session, requisition_id: int):
    db_req = db.query(models.Requisitions).filter(models.Requisitions.id == requisition_id).first()
    if not db_req:
        return None
    db.delete(db_req)
    db.commit()
    return db_req


#======================================= Candidate CRUD operations ======================================

def get_candidate(db: Session, candidate_id: str):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()

def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()

def create_candidate(db: Session, candidate: schemas.CandidateCreate):
    db_candidate = models.Candidate(
        name=candidate.name,
        position=candidate.position,
        email=candidate.email,
        phone=candidate.phone,
        location=candidate.location,
        experience=candidate.experience,
        skills=candidate.skills,
        rating=candidate.rating,
        notes=candidate.notes,
        resume_url=candidate.resume_url,
        recruiter=candidate.recruiter,
        status=candidate.status,
        requisition_id=candidate.requisition_id,
        source=candidate.source,         
        current_ctc=candidate.current_ctc,
        expected_ctc=candidate.expected_ctc,
        notice_period=candidate.notice_period,
        current_company=candidate.current_company,
        dob=candidate.dob,
        marital_status=candidate.marital_status,
        applied_date=datetime.utcnow(),
        last_activity=datetime.utcnow(),
        created_date=datetime.utcnow(),
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def update_candidate(db: Session, candidate_id: str, candidate: schemas.CandidateUpdate):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None
    for key, value in candidate.dict(exclude_unset=True).items():
        setattr(db_candidate, key, value)
    db_candidate.last_activity = datetime.utcnow()
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def delete_candidate(db: Session, candidate_id: str):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None
    db.delete(db_candidate)
    db.commit()
    return db_candidate
