from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
from app.models import requisition_skills, candidate_skills

from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import uuid
import enum
from enum import Enum
from sqlalchemy.sql import func

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(100), nullable=True)
    location = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)
    applied_date = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)
    rating = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    resume_url = Column(String(1000), default='new')
    recruiter = Column(String(100), nullable=True)
    status = Column(String(100), nullable=True)
    reject_reason = Column(String(100), nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    offer_made_date = Column(Date, nullable=True)
    offer_acceptence_date=Column(Date, nullable=True)
    offer_rejected_date = Column(Date,nullable=True)

    # FIX: Match Requisition.id type
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=True)
    requisition = relationship("Requisitions", backref="candidates")
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company",back_populates="candidates")
    offers = relationship("Offer", back_populates="candidate", cascade="all, delete-orphan")

    source = Column(String(50), nullable=True)
    current_ctc = Column(String(50), nullable=True)
    expected_ctc = Column(String(50), nullable=True)
    notice_period = Column(String(50), nullable=True)
    current_company = Column(String(100), nullable=True)
    dob = Column(Date, nullable=True)
    marital_status = Column(String(50), nullable=True)
    interviews = relationship("Interview", back_populates="candidate")

    files = relationship("File", back_populates="candidate", cascade="all, delete-orphan")
    scorecards = relationship("Scorecard", back_populates="candidate", cascade="all, delete")

    # Many-to-Many relationship for skills
    skills = relationship("Skill", secondary=candidate_skills, back_populates="candidates")
    


class CandidateActivityLog(Base):
    __tablename__ = "candidate_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id",ondelete="CASCADE"), nullable=False)
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=True)  # Added requisition_id
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True) 
    timestamp = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", backref="activity_logs")
    user = relationship("User", backref="candidate_activity_logs")


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)  # e.g., resume, jd, others
    file_url = Column(String(1000), nullable=False)  # path or S3/public URL
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Candidate (if file belongs to candidate)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=True)
    candidate = relationship("Candidate", back_populates="files")