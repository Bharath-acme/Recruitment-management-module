from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import uuid
import enum
from candidates.models import Candidate

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    candidate_id = Column(String(100), ForeignKey("candidates.id"), nullable=False)
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=False)

    candidate = relationship("Candidate", back_populates="interviews")

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
    requisition = relationship("Requisitions", back_populates="interviews")
