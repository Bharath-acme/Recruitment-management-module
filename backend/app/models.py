from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint, Enum as SAEnum
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
    approval_status = Column(String(100), nullable=True, default="Pending")  # e.g. Pending, Approved, Rejected

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
    offers = relationship("Offer", back_populates="candidate", cascade="all, delete-orphan")

    source = Column(String(50), nullable=True)
    current_ctc = Column(String(50), nullable=True)
    expected_ctc = Column(String(50), nullable=True)
    notice_period = Column(String(50), nullable=True)
    current_company = Column(String(100), nullable=True)
    dob = Column(Date, nullable=True)
    marital_status = Column(String(50), nullable=True)
    interviews = relationship("Interview", back_populates="candidate")


# ======================================== Interview Model =====================================

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    candidate_id = Column(String(100), ForeignKey("candidates.id"), nullable=False)
    requisition_id = Column(String(100), ForeignKey("requisitions.id"), nullable=False)

    interview_type = Column(String(100), nullable=False)   # e.g., technical, behavioral
    mode = Column(String(100), nullable=False)            # video, in-person
    datetime = Column(DateTime, nullable=False)
    duration = Column(Integer, default=60)
    location = Column(String(100), nullable=True)
    meeting_link = Column(String(100), nullable=True)
    interviewers = Column(Text, nullable=True)       # comma-separated string
    status = Column(String(100), default="scheduled")
    feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    # created_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="interviews")
    requisition = relationship("Requisitions", back_populates="interviews")

# ======================================== offers Model =====================================
class OfferStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    LETTER_GENERATED = "LETTER_GENERATED"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"

class ApprovalState(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"



class SalaryBand(Base):
    __tablename__ = "salary_bands"
    id = Column(Integer, primary_key=True)
    country = Column(String(64), nullable=False, index=True)
    grade = Column(String(64), nullable=False, index=True)
    min_amount = Column(Float, nullable=False)
    max_amount = Column(Float, nullable=False)
    __table_args__ = (UniqueConstraint("country", "grade", name="uq_country_grade"),)

class Blob(Base):
    __tablename__ = "blobs"
    id = Column(String(64), primary_key=True)  # e.g., s3 key or UUID
    path = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Offer(Base):
    __tablename__ = "offers"
    id = Column(Integer, primary_key=True)
    offer_id = Column(String(64), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    app_id = Column(Integer, ForeignKey("requisitions.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(String(64), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)

    grade = Column(String(64), nullable=False, index=True)
    base = Column(Float, nullable=False)
    allowances = Column(JSON, nullable=True, default={})
    benefits = Column(JSON, nullable=True, default={})
    variable_pay = Column(Float, nullable=True, default=0.0)
    currency = Column(String(8), default="USD")
    status = Column(SAEnum(OfferStatus), default=OfferStatus.DRAFT, index=True)
    expiry_date = Column(DateTime, nullable=True)
    letter_blob_id = Column(String(64), ForeignKey("blobs.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    approvals = relationship("ApprovalRecord", back_populates="offer", cascade="all, delete-orphan")
    letter_blob = relationship("Blob", foreign_keys=[letter_blob_id], uselist=False)
    requisitions = relationship("Requisitions", foreign_keys=[app_id])
    candidate = relationship("Candidate", foreign_keys=[candidate_id])

class ApprovalRecord(Base):
    __tablename__ = "approval_records"
    id = Column(Integer, primary_key=True)
    offer_id = Column(Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(64), nullable=False)  # e.g., 'Finance' or 'Leadership' or 'HR'
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    state = Column(SAEnum(ApprovalState), default=ApprovalState.PENDING, index=True)
    comment = Column(String(1024), nullable=True)
    acted_at = Column(DateTime, nullable=True)

    offer = relationship("Offer", back_populates="approvals")