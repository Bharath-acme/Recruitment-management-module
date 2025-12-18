from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from .schemas import *
from . import crud
from .models import *
from candidates import models
from requisitions.models import Requisitions

from app.auth import oauth2_scheme,get_current_user
from app.database import get_db
from app.models import User
from datetime import datetime, timedelta
from typing import List
from msal import ConfidentialClientApplication
from config import CLIENT_ID, CLIENT_SECRET, TENANT_ID,GRAPH_API
import requests
from msal import ConfidentialClientApplication
import time

router = APIRouter()

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPE = ["https://graph.microsoft.com/.default"]
SERVICE_MAILBOX = "b.kumar@aiatacme.com"



def get_graph_token():
    app = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=AUTHORITY
    )

    token = app.acquire_token_for_client(scopes=SCOPE)

    if "access_token" not in token:
        raise HTTPException(
            status_code=500,
            detail=f"Graph token error: {token}"
        )

    return token["access_token"]


def graph_headers():
    return {
        "Authorization": f"Bearer {get_graph_token()}",
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


@router.post("/free-busy")
def get_free_busy(payload: FreeBusyRequest):
    url = "https://graph.microsoft.com/v1.0/users/b.kumar@aiatacme.com/calendar/getSchedule"

    body = {
        "schedules": ["b.kumar@aiatacme.com"],
        "startTime": {"dateTime": payload.start.isoformat(), "timeZone": "UTC"},
        "endTime": {"dateTime": payload.end.isoformat(), "timeZone": "UTC"},
        "availabilityViewInterval": 30
    }

    res = requests.post(url, json=body, headers=graph_headers())

    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Calendar fetch failed")

    busy = res.json()["value"][0]["scheduleItems"]

    return [
        {"start": b["start"]["dateTime"], "end": b["end"]["dateTime"]}
        for b in busy
    ]
    url = "https://graph.microsoft.com/v1.0/me/calendar/getSchedule"

    body = {
        "schedules": ["b.kumar@aiatacme.com"],
        "startTime": {"dateTime": payload.start.isoformat(), "timeZone": "UTC"},
        "endTime": {"dateTime": payload.end.isoformat(), "timeZone": "UTC"},
        "availabilityViewInterval": 30
    }

    res = requests.post(url, json=body, headers=graph_headers(current_user))
    data = res.json()

    busy = data["value"][0]["scheduleItems"]
    return [
        {"start": b["start"]["dateTime"], "end": b["end"]["dateTime"]}
        for b in busy
    ]


@router.post("/schedule", response_model=InterviewResponse)
def schedule_interview(
    payload: CreateInterviewWithEvent,
    db: Session = Depends(get_db)
):
    candidate = db.query(models.Candidate).get(payload.candidate_id)
    requisition = db.query(Requisitions).get(payload.requisition_id)

    if not candidate or not requisition:
        raise HTTPException(status_code=404, detail="Invalid candidate or requisition")

    interviewers = db.query(User).filter(User.id.in_(payload.interviewers)).all()

    # =========================
    # 1️⃣ CREATE TEAMS MEETING
    # =========================
    meeting_payload = {
        "startDateTime": payload.start.isoformat(),
        "endDateTime": payload.end.isoformat(),
        "subject": f"{payload.interview_type.title()} Interview"
    }

    meeting_res = requests.post(
        f"https://graph.microsoft.com/v1.0/users/{SERVICE_MAILBOX}/onlineMeetings",
        headers=graph_headers(),
        json=meeting_payload
    )

    if meeting_res.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=meeting_res.text)

    meeting_data = meeting_res.json()
    join_url = meeting_data["joinUrl"]

    # =========================
    # 2️⃣ CREATE CALENDAR EVENT
    # =========================
    attendees = [
        {"emailAddress": {"address": candidate.email}, "type": "required"}
    ]

    for user in interviewers:
        attendees.append(
            {"emailAddress": {"address": user.email}, "type": "required"}
        )

    event_payload = {
        "subject": f"{payload.interview_type.title()} Interview",
        "start": {"dateTime": payload.start.isoformat(), "timeZone": "Asia/Kolkata"},
        "end": {"dateTime": payload.end.isoformat(), "timeZone": "Asia/Kolkata"},
        "attendees": attendees,
        "body": {
            "contentType": "HTML",
            "content": f"""
                <p>Interview scheduled</p>
                <p><b>Join Teams Meeting:</b></p>
                <a href="{join_url}">{join_url}</a>
            """
        }
    }

    event_res = requests.post(
        f"https://graph.microsoft.com/v1.0/users/{SERVICE_MAILBOX}/events",
        headers=graph_headers(),
        json=event_payload
    )

    if event_res.status_code not in (200, 201):
        raise HTTPException(status_code=500, detail=event_res.text)

    # =========================
    # 3️⃣ SAVE INTERVIEW
    # =========================
    interview = Interview(
        candidate_id=candidate.id,
        requisition_id=requisition.id,
        interview_type=payload.interview_type,
        mode=payload.mode,
        scheduled_at=payload.start,
        duration=int((payload.end - payload.start).total_seconds() / 60),
        meeting_link=join_url,
        interviewers=interviewers,
        company_id=requisition.company_id,
        status="scheduled"
    )

    db.add(interview)
    db.commit()
    db.refresh(interview)

    return interview





# @router.post("/create-event")
# def create_event(data: CreateEventPayload):

#     url = f"https://graph.microsoft.com/v1.0/users/{data.recruiter_email}/events"

#     event = {
#         "subject": data.subject,
#         "start": {"dateTime": data.start, "timeZone": "UTC"},
#         "end": {"dateTime": data.end, "timeZone": "UTC"},
#         "attendees": [
#             {"emailAddress": {"address": data.candidate_email}, "type": "required"},
#         ],
#         "body": {
#             "contentType": "HTML",
#             "content": data.body
#         }
#     }

#     response = requests.post(url, json=event, headers=graph_headers())
#     return response.json()


# @router.post("/send-mail")
# def send_mail(data: EmailPayload):

#     url = f"https://graph.microsoft.com/v1.0/users/{data.recruiter_email}/sendMail"

#     message = {
#         "message": {
#             "subject": data.subject,
#             "body": {"contentType": "HTML", "content": data.body},
#             "toRecipients": [
#                 {"emailAddress": {"address": data.candidate_email}}
#             ]
#         },
#         "saveToSentItems": "true"
#     }

#     response = requests.post(url, json=message, headers=graph_headers())
#     return response.json()


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
def list_interviews(
    db: Session = Depends(get_db),
    company_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None)
):
    return crud.get_interviews(db, company_id=company_id, status=status)

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

