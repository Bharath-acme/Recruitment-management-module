from pydantic import BaseModel, EmailStr
from datetime import date,datetime
from typing import Optional, List, Dict, Any
import enum
from candidates.schemas import CandidateMini
from requisitions.schemas import RequisitionMini    


class InterviewBase(BaseModel):
    candidate_id: str
    requisition_id: int
    interview_type: str
    mode: str
    datetime: datetime
    duration: int = 60
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    interviewers: List[str] = []
    status: str = "scheduled"
    feedback: Optional[str] = None
    score: Optional[int] = None
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewResponse(InterviewBase):
    id: str
    created_date: datetime
    candidate: CandidateMini
    requisition: RequisitionMini

    class Config:
        from_attributes = True

class ScorecardBase(BaseModel):
    technical_score: float
    behavioral_score: float
    cultural_score: float
    overall_recommendation: str
    technical_comments: Optional[str] = None
    behavioral_comments: Optional[str] = None
    cultural_comments: Optional[str] = None
    overall_comments: Optional[str] = None

class ScorecardCreate(ScorecardBase):
    candidate_id: str
    interview_id: str

class ScorecardResponse(ScorecardBase):
    id: int
    candidate_id: str
    interview_id: str

    class Config:
        from_attributes = True
