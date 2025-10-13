from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud, models
from app.database import get_db
from typing import List

router = APIRouter()

@router.post("/create-candidate", response_model=CandidateResponse)
def create_candidate(candidate: CandidateCreate, db: Session = Depends(get_db)):
    return crud.create_candidate(db=db, candidate=candidate)

@router.get("/", response_model=List[CandidateResponse])
def read_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_candidates(db, skip=skip, limit=limit)

@router.get("/{candidate_id}", response_model=CandidateResponse)
def read_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate

@router.put("/{candidate_id}", response_model=CandidateResponse)
def update_candidate(candidate_id: str, candidate: CandidateUpdate, db: Session = Depends(get_db)):
    db_candidate = crud.update_candidate(db, candidate_id, candidate)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate

@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.delete_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"detail": "Candidate deleted successfully"}


