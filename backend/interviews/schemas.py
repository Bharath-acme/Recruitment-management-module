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
        orm_mode = True
