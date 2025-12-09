from pydantic import BaseModel, EmailStr, Field
from datetime import date,datetime
from typing import Optional, List, Dict, Any
import enum
from app.schemas import Skill


class FileResponse(BaseModel):
    id: str
    file_name: str
    file_url: str
    file_type: Optional[str] = None

    class Config:
        from_attributes = True

class CandidateBase(BaseModel):
    name: str
    position: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[int] = None
    skills: Optional[List[str]] = Field(default_factory=list)
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
    # resume_file_id: Optional[str] = None 

class CandidateCreate(CandidateBase):
    requisition_id: Optional[int] = None

class CandidateUpdate(CandidateBase):
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
    reject_reason: Optional[str] = None
    # add this:
    # resume_file_id: Optional[str] = None  # link to File table if needed

class CandidateResponse(CandidateBase):
    id: str
    applied_date: datetime
    last_activity: datetime
    created_date: datetime
    requisition_id: Optional[int] = None
    reject_reason: Optional[str] = None
    skills: List[Skill] = []
    files: List[FileResponse] = []

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


   
