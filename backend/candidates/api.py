from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from . import schemas, crud
from app.database import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter()


@router.get("/", response_model=List[schemas.CandidateResponse])
def read_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_candidates(db, skip=skip, limit=limit)


@router.get("/{candidate_id}", response_model=schemas.CandidateResponse)
def read_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate


@router.post("/", response_model=schemas.CandidateCreate)
def create_candidate(
    candidate: schemas.CandidateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Parse resume only during creation (if required)
    return crud.create_candidate(db=db, candidate=candidate, current_user=current_user)


@router.put("/{candidate_id}", response_model=schemas.CandidateCreate)
def update_candidate(
    candidate_id: str,
    candidate: schemas.CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Resume parsing skipped intentionally
    updated_candidate = crud.update_candidate(db, candidate_id, candidate, current_user)
    return updated_candidate


@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crud.delete_candidate(db, candidate_id, current_user)
    return {"message": f"Candidate {candidate_id} deleted successfully"}
