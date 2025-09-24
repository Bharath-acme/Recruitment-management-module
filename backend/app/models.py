from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import uuid
import enum


requisition_recruiter = Table(
    "requisition_recruiter",
    Base.metadata,
    Column("requisition_id", Integer, ForeignKey("requisitions.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(100), nullable=False)
    company = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    hashed_password = Column(String(100), nullable=False)

    requisitions = relationship("Requisitions", back_populates="recruiter")


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

    # Job type details
    employment_type = Column(Enum(EmploymentType), nullable=False, default=EmploymentType.FULL_TIME)
    work_mode = Column(Enum(WorkMode), nullable=False, default=WorkMode.ONSITE)
    location = Column(String(100), nullable=True)

    # Priority & status
    priority = Column(Enum(Priority), nullable=False, default=Priority.MEDIUM)
    status = Column(Enum(Status), nullable=False, default=Status.OPEN)

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
    # positions = relationship("Position", back_populates="requisition", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)
    skills = Column(JSON, nullable=True)
    applied_date = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    rating = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    resume_url = Column(String(1000), nullable=True)
    recruiter = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow)

    # FIX: Match Requisition.id type
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=True)
    requisition = relationship("Requisitions", backref="candidates")

    source = Column(String(50), nullable=True)
    current_ctc = Column(String(50), nullable=True)
    expected_ctc = Column(String(50), nullable=True)
    notice_period = Column(String(50), nullable=True)
    current_company = Column(String(100), nullable=True)
    dob = Column(Date, nullable=True)
    marital_status = Column(String(50), nullable=True)