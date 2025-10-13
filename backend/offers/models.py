from sqlalchemy import Column, Integer, String, Float, Date, Text, Enum, DateTime,Table, ForeignKey,UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
import uuid
import enum


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