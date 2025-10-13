from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud, models
from app.auth import oauth2_scheme
from app.database import get_db
from typing import List

router = APIRouter()

@router.post("/interviews/", response_model=InterviewResponse)
def create_interview(interview: InterviewCreate, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == interview.candidate_id).first()
    requisition = db.query(models.Requisitions).filter(models.Requisitions.id == interview.requisition_id).first()

    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate not found")
    if not requisition:
        raise HTTPException(status_code=400, detail="Requisition not found")

    return crud.create_interview(db, interview)

@router.get("/", response_model=List[InterviewResponse])
def list_interviews(db: Session = Depends(get_db)):
    return crud.get_interviews(db)

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    db_interview = crud.get_interview(db, interview_id)
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return db_interview

