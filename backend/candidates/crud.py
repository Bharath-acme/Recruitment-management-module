from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime, date
from typing import Optional
from . import models, schemas
from app.models import User


def get_candidate(db: Session, candidate_id: str):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()


def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()


def create_candidate(db: Session, candidate: schemas.CandidateCreate, current_user: User):
    # ✅ Check if candidate already exists
    existing_candidate = db.query(models.Candidate).filter(
        models.Candidate.email == candidate.email
    ).first()
    if existing_candidate:
        raise HTTPException(status_code=400, detail=f"Candidate with email '{candidate.email}' already exists.")

    # ✅ Create candidate
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

        # ✅ Save resume record (if available)
        if candidate.resume_url:
            file_entry = models.File(
                file_name=f"{candidate.name}_resume",
                file_type="resume",
                file_url=candidate.resume_url,
                candidate_id=db_candidate.id,
                uploaded_by=current_user.name,
            )
            db.add(file_entry)
            db.commit()

        # ✅ Log creation
        create_candidate_activity_log(
            db=db,
            candidate_id=db_candidate.id,
            user=current_user,
            action="Created Candidate",
            details=f"Candidate '{db_candidate.name}' created."
        )

        return db_candidate

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating candidate: {e}")
        raise HTTPException(status_code=500, detail="Error creating candidate")


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


def update_candidate(db: Session, candidate_id: str, candidate: schemas.CandidateUpdate, current_user: User):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    old_data = clean_dict(db_candidate.__dict__.copy())
    changes = []

    for field, new_value in candidate.dict(exclude_unset=True).items():
        old_value = getattr(db_candidate, field)
        if old_value != new_value:
            changes.append(f"{field} changed from '{old_value}' to '{new_value}'")
            setattr(db_candidate, field, new_value)

    db_candidate.last_activity = datetime.utcnow()
    db.commit()
    db.refresh(db_candidate)

    # ✅ Handle resume update (no parsing)
    if candidate.resume_url:
        existing_file = (
            db.query(models.File)
            .filter(models.File.candidate_id == candidate_id, models.File.file_type == "resume")
            .first()
        )

        if existing_file:
            existing_file.file_url = candidate.resume_url
            existing_file.uploaded_at = datetime.utcnow()
        else:
            new_file = models.File(
                file_name=f"{db_candidate.name}_resume",
                file_type="resume",
                file_url=candidate.resume_url,
                candidate_id=db_candidate.id,
                uploaded_by=current_user.name,
            )
            db.add(new_file)
        db.commit()

    if changes:
        create_candidate_activity_log(
            db=db,
            candidate_id=candidate_id,
            user=current_user,
            action="Updated Candidate",
            details="; ".join(changes),
        )

    return db_candidate


def delete_candidate(db: Session, candidate_id: str, current_user: User):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    db.delete(db_candidate)
    db.commit()

    create_candidate_activity_log(
        db=db,
        candidate_id=candidate_id,
        user=current_user,
        action="Deleted Candidate",
        details=f"Candidate '{db_candidate.name}' deleted.",
    )
    return db_candidate


def create_candidate_activity_log(
    db: Session,
    candidate_id: str,
    user: User,
    action: str,
    details: Optional[str] = None,
):
    log = models.CandidateActivityLog(
        candidate_id=candidate_id,
        user_id=user.id,
        username=user.name,
        action=action,
        details=details,
        timestamp=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
