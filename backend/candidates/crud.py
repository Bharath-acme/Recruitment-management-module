from sqlalchemy.orm import Session
# from app import models, schemas
from datetime import datetime, date  # Ensure proper import of date
from typing import List, Optional
from . import models, schemas
from app.models import User 
from app.auth import get_current_user
from fastapi import Depends

def get_candidate(db: Session, candidate_id: str):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()

def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()

def create_candidate(db: Session, candidate: schemas.CandidateCreate):
    existing_candidate = db.query(models.Candidate).filter(
        models.Candidate.email == candidate.email
    ).first()
    if existing_candidate:
        raise HTTPException(
            status_code=400,
            detail=f"Candidate with email '{candidate.email}' already exists."
        )
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
    try:
        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)
        return db_candidate
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating candidate: {e}")
        raise HTTPException(status_code=500, detail="Database error")

    

def clean_dict(data: dict) -> dict:
    cleaned_data = {}
    for key, value in data.items():
        if key == "_sa_instance_state":
            continue
        if isinstance(value, (date, datetime)):
            cleaned_data[key] = value.isoformat()
        else:
            cleaned_data[key] = value
    return cleaned_data

def update_candidate(db: Session, candidate_id: str, candidate: schemas.CandidateUpdate, current_user:User):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None

    # ✅ Check differences BEFORE updating
    old_data = clean_dict(db_candidate.__dict__.copy())
    changes = []
    for field, new_value in candidate.dict(exclude_unset=True).items():
        old_value = getattr(db_candidate, field)
        if old_value != new_value:
            changes.append(f"{field} changed from '{old_value}' to '{new_value}'")
            setattr(db_candidate, field, new_value)

    db_candidate.last_activity = datetime.utcnow()

    # ✅ Now actually update it
    db.commit()
    db.refresh(db_candidate)

    # ✅ Log activity if any field changed
    if changes:
        create_candidate_activity_log(
            db=db,
            candidate_id=candidate_id,
            user=current_user,
            action="Updated Candidate",
            details="; ".join(changes)
        )

    return db_candidate


def delete_candidate(db: Session, candidate_id: str):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None

    db.delete(db_candidate)
    db.commit()

    # 🔹 Create log
    create_candidate_activity_log(
        db=db,
        candidate_id=candidate_id,
        user=current_user,
        action="Deleted Candidate",
        details=f"Candidate deleted by {current_user.name}"
    )

    return db_candidate



def create_candidate_activity_log(
    db: Session,
    candidate_id: str,
    action: str,
    user: Optional[User] = None,
    user_id: Optional[int] = None,
    username: Optional[str] = None,
    details: Optional[str] = None,
    requisition_id: Optional[int] = None
):
    """
    Create a new activity log entry for a candidate.
    Either provide a 'user' object, or 'user_id' and 'username'.
    """
    if user:
        user_id = user.id
        username = user.name

    if not user_id or not username:
        raise ValueError("Either 'user' or both 'user_id' and 'username' must be provided")

    log = models.CandidateActivityLog(
        candidate_id=candidate_id,
        requisition_id=requisition_id,
        user_id=user_id,
        username=username,
        action=action,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
