from pydantic import BaseModel, EmailStr
from datetime import date,datetime
from typing import Optional, List, Dict, Any
import enum




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