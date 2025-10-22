from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from typing import List, Optional

def create_interview(db: Session, interview: schemas.InterviewCreate):
    db_interview = models.Interview(
        **interview.dict(exclude={"interviewers"}),
        interviewers=",".join(interview.interviewers)
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    # Serialize response to match InterviewResponse
    interviewers_list = db_interview.interviewers.split(",") if db_interview.interviewers else []
    requisition_id_str = str(db_interview.requisition_id)
    created_date = getattr(db_interview, "created_date", None)
    if not created_date:
        created_date = db_interview.datetime
    req_obj = db_interview.requisition
    req_id = str(getattr(req_obj, "req_id", "")) if req_obj else ""
    recruiter = None
    if req_obj and hasattr(req_obj, "recruiter"):
        recruiter = {
            "id": req_obj.recruiter.id,
            "name": req_obj.recruiter.name,
            "email": req_obj.recruiter.email,
        } if req_obj.recruiter else None
    requisition_dict = {
        **req_obj.__dict__,
        "req_id": req_id,
        "recruiter": recruiter
    } if req_obj else None
    return {
        "id": db_interview.id,
        "candidate_id": db_interview.candidate_id,
        "requisition_id": requisition_id_str,
        "interview_type": db_interview.interview_type,
        "mode": db_interview.mode,
        "datetime": db_interview.datetime,
        "duration": db_interview.duration,
        "location": db_interview.location,
        "meeting_link": db_interview.meeting_link,
        "interviewers": interviewers_list,
        "status": db_interview.status,
        "feedback": db_interview.feedback,
        "score": db_interview.score,
        "notes": db_interview.notes,
        "created_date": created_date,
        "candidate": db_interview.candidate,
        "requisition": requisition_dict
    }

def get_interviews(db: Session):
    interviews = db.query(models.Interview).all()
    result = []
    for interview in interviews:
        # Ensure interviewers is a list
        interviewers = interview.interviewers.split(",") if interview.interviewers else []
        # Ensure requisition_id is a string
        requisition_id = str(interview.requisition_id)
        # Ensure created_date is present
        created_date = getattr(interview, "created_date", None)
        if not created_date:
            created_date = interview.datetime
        req_obj = interview.requisition
        req_id = str(getattr(req_obj, "req_id", "")) if req_obj else ""
        recruiter = None
        if req_obj and hasattr(req_obj, "recruiter"):
            recruiter = {
                "id": req_obj.recruiter.id,
                "name": req_obj.recruiter.name,
                "email": req_obj.recruiter.email,
            } if req_obj.recruiter else None
        requisition_dict = {
            **req_obj.__dict__,
            "req_id": req_id,
            "recruiter": recruiter
        } if req_obj else None
        result.append({
            "id": interview.id,
            "candidate_id": interview.candidate_id,
            "requisition_id": requisition_id,
            "interview_type": interview.interview_type,
            "mode": interview.mode,
            "datetime": interview.datetime,
            "duration": interview.duration,
            "location": interview.location,
            "meeting_link": interview.meeting_link,
            "interviewers": interviewers,
            "status": interview.status,
            "feedback": interview.feedback,
            "score": interview.score,
            "notes": interview.notes,
            "created_date": created_date,
            "candidate": interview.candidate,
            "requisition": requisition_dict
        })
    return result

def get_interview(db: Session, interview_id: str):
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        return None
    interviewers = interview.interviewers.split(",") if interview.interviewers else []
    requisition_id = str(interview.requisition_id)
    created_date = getattr(interview, "created_date", None)
    if not created_date:
        created_date = interview.datetime
    req_obj = interview.requisition
    req_id = str(getattr(req_obj, "req_id", "")) if req_obj else ""
    recruiter = None
    if req_obj and hasattr(req_obj, "recruiter"):
        recruiter = {
            "id": req_obj.recruiter.id,
            "name": req_obj.recruiter.name,
            "email": req_obj.recruiter.email,
        } if req_obj.recruiter else None
    requisition_dict = {
        **req_obj.__dict__,
        "req_id": req_id,
        "recruiter": recruiter
    } if req_obj else None
    return {
        "id": interview.id,
        "candidate_id": interview.candidate_id,
        "requisition_id": requisition_id,
        "interview_type": interview.interview_type,
        "mode": interview.mode,
        "datetime": interview.datetime,
        "duration": interview.duration,
        "location": interview.location,
        "meeting_link": interview.meeting_link,
        "interviewers": interviewers,
        "status": interview.status,
        "feedback": interview.feedback,
        "score": interview.score,
        "notes": interview.notes,
        "created_date": created_date,
        "candidate": interview.candidate,
        "requisition": requisition_dict
    }
