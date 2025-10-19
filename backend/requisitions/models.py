from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import uuid
import enum


#  Optionally define some enums for consistency
class EmploymentType(str, enum.Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    CONTRACT = "contract"
    INTERN = "internship"


class WorkMode(str, enum.Enum):
    ONSITE = "onsite"
    REMOTE = "remote"
    HYBRID = "hybrid"


class Priority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Status(str, enum.Enum):
    OPEN = "open"
    CLOSED = "Closed"
    ON_HOLD = "On Hold"
    CANCELLED = "Cancelled"




class Requisitions(Base):
    __tablename__ = "requisitions"

    id = Column(Integer, primary_key=True, index=True)
    req_id = Column(String(50), unique=True, index=True, nullable=False)
    # Core info
    position = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    experience = Column(Integer, nullable=True)  # years of experience required
    grade = Column(String(50), nullable=True)   # e.g. L1, L2, Senior
    created_date = Column(DateTime, default=datetime.utcnow)

    # Job type  
    employment_type = Column(Enum(EmploymentType), nullable=False, default=EmploymentType.FULL_TIME)
    work_mode = Column(Enum(WorkMode), nullable=False, default=WorkMode.ONSITE)
    location = Column(String(100), nullable=True)

    # Priority & status
    priority = Column(Enum(Priority), nullable=False, default=Priority.MEDIUM)
    status = Column(Enum(Status), nullable=False, default=Status.OPEN)
    approval_status = Column(String(100), nullable=True, default="pending")  # e.g. Pending, Approved, Rejected

    # Salary details
    min_salary = Column(Float, nullable=True)
    max_salary = Column(Float, nullable=True)
    currency = Column(String(10), nullable=True)  # e.g. USD, AED, INR

    # Additional info
    positions_count = Column(Integer, nullable=False, default=1)
    skills = Column(Text, nullable=True)  # store comma-separated skills or use JSON
    target_startdate = Column(Date, nullable=True)
    hiring_manager = Column(String(100), nullable=True)
    job_description = Column(Text, nullable=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    recruiter = relationship("User", back_populates="requisitions")
    interviews = relationship("Interview", back_populates="requisition")
    # recruiters = relationship("User", secondary=requisition_recruiter, backref="assigned_requisitions")
    offers = relationship("Offer", back_populates="requisitions", cascade="all, delete-orphan")
    activity_logs = relationship("RequisitionActivityLog", back_populates="requisition", cascade="all, delete-orphan")
    # positions = relationship("Position", back_populates="requisition", cascade="all, delete-orphan")


class RequisitionActivityLog(Base):
    __tablename__ = "requisition_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    requisition = relationship("Requisitions", back_populates="activity_logs")
    user = relationship("User", back_populates="activity_logs")
