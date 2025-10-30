from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud, models
from .models import *
from requisitions.models import Requisitions
from app.auth import oauth2_scheme
from app.database import get_db
from typing import List

router = APIRouter()

@router.post("", response_model=InterviewResponse)
def create_interview(interview: InterviewCreate, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == interview.candidate_id).first()
    requisition = db.query(Requisitions).filter(Requisitions.id == interview.requisition_id).first()

    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate not found")
    if not requisition:
        raise HTTPException(status_code=400, detail="Requisition not found")

    return crud.create_interview(db, interview)

@router.get("", response_model=List[InterviewResponse])
def list_interviews(db: Session = Depends(get_db)):
    return crud.get_interviews(db)

@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    db_interview = crud.get_interview(db, interview_id)
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return db_interview

# @router.post("/", response_model=ScorecardOut)
# def create_scorecard(scorecard_data: ScorecardCreate, db: Session = Depends(get_db)):
#     candidate = db.query(models.Candidate).filter(models.Candidate.id == scorecard_data.candidate_id).first()
#     interview = db.query(Interview).filter(Interview.id == scorecard_data.interview_id).first()

#     if not candidate or not interview:
#         raise HTTPException(status_code=404, detail="Candidate or Interview not found")

#     scorecard = Scorecard(**scorecard_data.dict())
#     db.add(scorecard)
#     db.commit()
#     db.refresh(scorecard)
#     return scorecard

@router.post("/{interview_id}/scorecard", response_model=ScorecardResponse)
def create_scorecard(interview_id: str, payload: ScorecardCreate, db: Session = Depends(get_db)):
    scorecard = Scorecard( **payload.dict())
    db.add(scorecard)
    db.commit()
    db.refresh(scorecard)
    return scorecard

@router.get("/{interview_id}/scorecard", response_model=ScorecardResponse)
def get_scorecard(interview_id: str, db: Session = Depends(get_db)):
    scorecard = db.query(Scorecard).filter(Scorecard.interview_id == interview_id).first()
    if not scorecard:
        raise HTTPException(status_code=404, detail="Scorecard not found")
    return scorecard

