from pydantic import BaseModel, EmailStr
from datetime import date,datetime
from typing import Optional, List, Dict, Any
import enum
from .models import EmploymentType, WorkMode, Priority, Status


class RecruiterBase(BaseModel):
    id: int
    name: str
   
    class Config:
        orm_mode = True



class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    company: str
    country: str
    

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserResponse(UserBase):
    id: int
    requisitions: List["RequisitionMini"] = [] 
    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    email: str
    password: str

class RecruiterOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True

class PositionBase(BaseModel):
    requisition_id: int
    position_name: str
    skills: List[str]
    position_desc: str
    status: str

class PositionCreate(PositionBase):
    pass

class PositionResponse(PositionBase):
    id: int
    class Config:
        orm_mode = True


# Base schema (common fields)
class RequisitionBase(BaseModel):
    position: str
    department: str
    experience: Optional[int] = None
    grade: Optional[str] = None
    employment_type: EmploymentType
    work_mode: WorkMode
    location: Optional[str] = None
    priority: Priority
    min_salary: Optional[float] = None
    max_salary: Optional[float] = None
    currency: Optional[str] = None
    positions_count: Optional[int] = None
    skills: Optional[str] = None
    target_startdate: Optional[date] = None
    hiring_manager: Optional[str] = None
    status: Status = Status.OPEN   
    job_description: Optional[str] = None
    
    




# For creating requisition
class RequisitionCreate(RequisitionBase):
     pass


# For updating requisition
class RequisitionUpdate(RequisitionBase):
    approval_status: Optional[str] = "Pending"
    recruiter_id: Optional[int] = None


# Response schema
class RequisitionResponse(RequisitionBase):
    id: int
    created_date: datetime
    req_id: str 
    recruiter_id: Optional[int] = None   
    recruiter: Optional[RecruiterOut]
    candidates: List["CandidateResponse"] = [] 
    approval_status: Optional[str] = "Pending"
    # positions: List[PositionResponse] = []
    class Config:
        orm_mode = True

class RequisitionMini(BaseModel):
    id: int
    position: str
    status: Status

    class Config:
        orm_mode = True

class RequisitionApprovalUpdate(BaseModel):
    approval_status: str

class TeamAssignToRequisition(BaseModel):
    recruiter_id: Optional[int] = None


class ActivityLogBase(BaseModel):
    requisition_id: int
    user_id: int
    username: str
    action: str
    details: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogResponse(ActivityLogBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
# ======================================== Candidate Schemas =====================================

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
    requisition_id: Optional[str] = None
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
    requisition_id: Optional[str] = None
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
        orm_mode = True

class candidateMini(BaseModel):
    id: str
    name: str
    email: EmailStr
    position: str
    requisition_id: Optional[int] = None

    class Config:
        orm_mode = True

UserResponse.update_forward_refs()
RequisitionResponse.update_forward_refs()


# ======================================== Interview Schemas =====================================

class InterviewBase(BaseModel):
    candidate_id: str
    requisition_id: str
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
    candidate: candidateMini
    requisition: RequisitionMini

    class Config:
        orm_mode = True


#========================================= offers Schemas =====================================

class Allowances(BaseModel):
    housing: Optional[float] = 0.0
    transport: Optional[float] = 0.0
    other: Optional[Dict[str, float]] = {}

class Benefits(BaseModel):
    medical: Optional[bool] = False
    tickets: Optional[int] = 0
    other: Optional[Dict[str, Any]] = {}

class OfferCreate(BaseModel):
    app_id: int
    candidate_id: int
    grade: str
    base: float
    allowances: Optional[Allowances] = Allowances()
    benefits: Optional[Benefits] = Benefits()
    variable_pay: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    expiry_days: Optional[int] = 14
    country: Optional[str] = "IN"

class OfferOut(BaseModel):
    offer_id: str
    app_id: int
    candidate_id: int
    grade: str
    base: float
    allowances: Dict[str, Any]
    benefits: Dict[str, Any]
    variable_pay: float
    currency: str
    status: str
    expiry_date: Optional[datetime]
    approvals: List[Dict[str, Any]] = []

    class Config:
        orm_mode = True

class ApproverAction(BaseModel):
    role: str
    action: str  # APPROVED or REJECTED
    comment: Optional[str] = None

class CandidateAction(BaseModel):
    action: str  # ACCEPT / DECLINE / COUNTER
    counter_base: Optional[float] = None
    counter_note: Optional[str] = None