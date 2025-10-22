from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base
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
    


class CandidateActivityLog(Base):
    __tablename__ = "candidate_activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False)
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=True)  # Added requisition_id
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    username = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True) 
    timestamp = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", backref="activity_logs")
    user = relationship("User", backref="candidate_activity_logs")