from pydantic import BaseModel, EmailStr
from datetime import date,datetime
from typing import Optional, List
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
    recruiter_id: Optional[int] = None
    




# For creating requisition
class RequisitionCreate(RequisitionBase):
     pass


# For updating requisition
class RequisitionUpdate(RequisitionBase):
    pass


# Response schema
class RequisitionResponse(RequisitionBase):
    id: int
    created_date: datetime
    req_id: str    
    recruiter: Optional[RecruiterOut]
    candidates: List["CandidateResponse"] = [] 
    # positions: List[PositionResponse] = []
    class Config:
        orm_mode = True

class RequisitionMini(BaseModel):
    id: int
    position: str
    status: Status

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

UserResponse.update_forward_refs()
RequisitionResponse.update_forward_refs()