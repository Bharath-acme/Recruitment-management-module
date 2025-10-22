from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud, models
from app.database import get_db
from typing import List
from app.auth import get_current_user
from app.models import User

router = APIRouter()

@router.post("", response_model=CandidateResponse)
def create_candidate(candidate: CandidateCreate, db: Session = Depends(get_db)):
    return crud.create_candidate(db=db, candidate=candidate)

@router.get("", response_model=List[CandidateResponse])
def read_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_candidates(db, skip=skip, limit=limit)

@router.get("/{candidate_id}", response_model=CandidateResponse)
def read_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate

@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: str, candidate: CandidateUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_candidate = crud.update_candidate(db, candidate_id, candidate, current_user)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.delete_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"detail": "Candidate deleted successfully"}

def get_candidate_logs(db: Session, candidate_id: int):
    return (
        db.query(models.CandidateActivityLog)
        .filter(models.CandidateActivityLog.candidate_id == candidate_id)
        .order_by(models.CandidateActivityLog.created_at.desc())
        .all()
    )

# @router.get("/{candidate_id}/activity-logs", response_model=List[CandidateActivityLogBase])
# def read_candidate_logs(candidate_id: str, db: Session = Depends(get_db)):
#     db_candidate = crud.get_candidate(db, candidate_id)
#     if not db_candidate:
#         raise HTTPException(status_code=404, detail="Candidate not found")
#     logs = get_candidate_logs(db, candidate_id)
#     return logs

@router.get("/{candidate_id}/activity-logs", response_model=List[CandidateActivityLogOut])
def get_candidate_activity_logs(candidate_id: str, db: Session = Depends(get_db)):
    """Retrieve activity logs for a specific candidate."""
    logs = db.query(models.CandidateActivityLog)\
        .filter(models.CandidateActivityLog.candidate_id == candidate_id)\
        .order_by(models.CandidateActivityLog.timestamp.desc())\
        .all()
    return logs


