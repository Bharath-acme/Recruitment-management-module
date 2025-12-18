from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import uuid
import enum


interview_interviewers = Table(
    "interview_interviewers",
    Base.metadata,
    Column("interview_id", String(100), ForeignKey("interviews.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(100), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    
    candidate_id = Column(String(100), ForeignKey("candidates.id"), nullable=False)
    requisition_id = Column(Integer, ForeignKey("requisitions.id"), nullable=False)

    candidate = relationship("Candidate", back_populates="interviews")

    interview_type = Column(String(100), nullable=False)   # e.g., technical, behavioral
    mode = Column(String(100), nullable=False)            # video, in-person
    scheduled_at = Column(DateTime, nullable=False)
    duration = Column(Integer, default=60)
    location = Column(String(100), nullable=True)
    meeting_link = Column(String(100), nullable=True)
    # interviewers = Column(Text, nullable=True)  
    
    interviewers = relationship(
        "User",
        secondary=interview_interviewers,
        back_populates="interviews"
    )
         # comma-separated string
    status = Column(String(100), default="scheduled")
    feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_date = Column(DateTime, default=datetime.utcnow)
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company",back_populates="interviews")
    # Relationships
    requisition = relationship("Requisitions", back_populates="interviews")
    scorecard = relationship("Scorecard", back_populates="interview", uselist=False)
    



class Scorecard(Base):
    __tablename__ = "scorecards"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(100), ForeignKey("candidates.id", ondelete="CASCADE"))
    interview_id = Column(String(100), ForeignKey("interviews.id", ondelete="CASCADE"))

    technical_score = Column(Float)
    behavioral_score = Column(Float)
    cultural_score = Column(Float)
    overall_recommendation = Column(String(50))
    technical_comments = Column(Text)
    behavioral_comments = Column(Text)
    cultural_comments = Column(Text)
    overall_comments = Column(Text)

    candidate = relationship("Candidate", back_populates="scorecards")
    interview = relationship("Interview", back_populates="scorecard")
