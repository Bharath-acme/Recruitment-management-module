from pydantic import BaseModel, EmailStr, Field
from datetime import date,datetime
from typing import Optional, List, Dict, Any
import enum




class CandidateBase(BaseModel):
    name: str
    position: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    skills: Optional[List[str]] = []
    rating: Optional[int] = 0
    notes: Optional[str] = None
    resume_url: Optional[str] = None
    recruiter: Optional[str] = None
    status: Optional[str] = None
    requisition_id: Optional[int] = None
    source: Optional[str] = None
    current_ctc: Optional[str] = None
    expected_ctc: Optional[str] = None
    notice_period: Optional[str] = None
    current_company: Optional[str] = None
    dob: Optional[date] = None
    marital_status: Optional[str] = None

class CandidateCreate(CandidateBase):
    requisition_id: Optional[int] = None

class CandidateUpdate(CandidateBase):
    id: Optional[str] = None  # Added id field
    name: Optional[str] = None
    position: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    skills: Optional[List[str]] = None
    notes: Optional[str] = None
    resume_url: Optional[str] = None
    recruiter: Optional[str] = None
    status: Optional[str] = None
    requisition_id: Optional[int] = None
    source: Optional[str] = None
    current_ctc: Optional[str] = None
    expected_ctc: Optional[str] = None
    notice_period: Optional[str] = None
    current_company: Optional[str] = None
    dob: Optional[date] = None
    marital_status: Optional[str] = None

class CandidateResponse(CandidateBase):
    id: str
    applied_date: datetime
    last_activity: datetime
    created_date: datetime
    requisition_id: Optional[int] = None

    class Config:
        from_attributes = True

class CandidateMini(BaseModel):
    id: str
    name: str
    email: EmailStr
    position: str
    requisition_id: Optional[int] = None

    class Config:
        from_attributes = True


# Base schema for CandidateActivityLog
class CandidateActivityLogBase(BaseModel):
    candidate_id: str
    requisition_id: Optional[int] = None
    user_id: int
    username: str
    action: str
    details: Optional[str] = None
  

# Schema for creating logs
class CandidateActivityLogCreate(CandidateActivityLogBase):
    pass

# Schema for returning logs
class CandidateActivityLogOut(CandidateActivityLogBase):
    id: int
    created_at: datetime = Field(..., alias="timestamp")

    class Config:
        from_attributes = True
