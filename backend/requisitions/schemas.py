from pydantic import BaseModel, EmailStr
from datetime import date,datetime
from typing import Optional, List, Dict, Any
import enum
from .models import EmploymentType, WorkMode, Priority, Status
from candidates.schemas import CandidateResponse



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
    # Resolve forward references
    

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
    # Resolve forward references
    


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

UserResponse.update_forward_refs()
RequisitionResponse.update_forward_refs()