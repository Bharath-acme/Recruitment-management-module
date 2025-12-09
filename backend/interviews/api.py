from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud
from .models import *
from candidates import models
from requisitions.models import Requisitions

from app.auth import oauth2_scheme
from app.database import get_db
from typing import List
from msal import ConfidentialClientApplication
from config import CLIENT_ID, CLIENT_SECRET, TENANT_ID,GRAPH_API
import requests

router = APIRouter()


AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["https://graph.microsoft.com/.default"]

def get_graph_token():
    app = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=AUTHORITY
    )
    token = app.acquire_token_for_client(scopes=SCOPE)
    if "access_token" not in token:
        raise Exception("Unable to get Graph token")
    return token["access_token"]

def graph_headers():
    return {
        "Authorization": f"Bearer {get_graph_token()}",
        "Content-Type": "application/json"
    }

@router.post("/free-busy")
def get_free_busy(req: CalendarRequest):

    url = "https://graph.microsoft.com/v1.0/users/{}/calendar/getSchedule".format(
        req.recruiter_email
    )

    body = {
        "schedules": [req.recruiter_email],
        "startTime": {"dateTime": req.start, "timeZone": "UTC"},
        "endTime": {"dateTime": req.end, "timeZone": "UTC"},
        "availabilityViewInterval": 30
    }

    response = requests.post(url, json=body, headers=graph_headers())
    print("my_calendar", response.json())
    return response.json()



@router.post("/create-event")
def create_event(data: CreateEventPayload):

    url = f"https://graph.microsoft.com/v1.0/users/{data.recruiter_email}/events"

    event = {
        "subject": data.subject,
        "start": {"dateTime": data.start, "timeZone": "UTC"},
        "end": {"dateTime": data.end, "timeZone": "UTC"},
        "attendees": [
            {"emailAddress": {"address": data.candidate_email}, "type": "required"},
        ],
        "body": {
            "contentType": "HTML",
            "content": data.body
        }
    }

    response = requests.post(url, json=event, headers=graph_headers())
    return response.json()


@router.post("/send-mail")
def send_mail(data: EmailPayload):

    url = f"https://graph.microsoft.com/v1.0/users/{data.recruiter_email}/sendMail"

    message = {
        "message": {
            "subject": data.subject,
            "body": {"contentType": "HTML", "content": data.body},
            "toRecipients": [
                {"emailAddress": {"address": data.candidate_email}}
            ]
        },
        "saveToSentItems": "true"
    }

    response = requests.post(url, json=message, headers=graph_headers())
    return response.json()


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

