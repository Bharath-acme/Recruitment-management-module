from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud
from .models import *
from candidates import models
from requisitions.models import Requisitions

from app.auth import oauth2_scheme,get_current_user
from app.database import get_db
from typing import List
from msal import ConfidentialClientApplication
from config import CLIENT_ID, CLIENT_SECRET, TENANT_ID,GRAPH_API
import requests
from msal import ConfidentialClientApplication
import time

router = APIRouter()

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["https://graph.microsoft.com/.default"]



def refresh_graph_token(user):
    """
    Refresh recruiter’s delegated access token using the refresh token.
    """

    app = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=AUTHORITY
    )

    result = app.acquire_token_by_refresh_token(
        user.graph_refresh_token,
        scopes=SCOPE
    )

    if "access_token" not in result:
        raise Exception("Failed to refresh Microsoft Graph token")

    # Save latest tokens in DB
    user.graph_access_token = result["access_token"]
    user.graph_refresh_token = result.get("refresh_token", user.graph_refresh_token)

    return user.graph_access_token


def graph_headers(user):
    access_token = user.graph_access_token

    # If token expired → refresh
    if not access_token:
        access_token = refresh_graph_token(user)

    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

# @router.post("/free-busy")
# async def get_free_busy(request: FreeBusyRequest, current_user=Depends(get_current_user)):
#     access_token = current_user.graph_access_token  # Your stored MS token

#     start = datetime.utcnow()
#     end = start + timedelta(days=30)

#     url = "https://graph.microsoft.com/v1.0/me/calendar/getSchedule"

#     payload = {
#         "schedules": [current_user.email],  # recruiter calendar ONLY
#         "startTime": {"dateTime": start.isoformat(), "timeZone": "UTC"},
#         "endTime": {"dateTime": end.isoformat(), "timeZone": "UTC"},
#         "availabilityViewInterval": 30
#     }

#     headers = {"Authorization": f"Bearer {access_token}"}

#     res = requests.post(url, json=payload, headers=headers)
#     data = res.json()

#     busy = data["value"][0]["scheduleItems"]

#     events = [
#         {"start": item["start"]["dateTime"], "end": item["end"]["dateTime"]}
#         for item in busy
#     ]

#     return {"calendarEvents": events}




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

