from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey,Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

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
    company_size = Column(String(100), nullable=True)
    company_desc = Column(String(200),nullable=True)
    country = Column(String(100), nullable=False)
    hashed_password = Column(String(100), nullable=False)
    requisitions = relationship("Requisitions", back_populates="recruiter")
    activity_logs = relationship("RequisitionActivityLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")

# class PasswordResetToken(Base):
#     __tablename__ = "password_reset_tokens"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"))
#     token = Column(String(255), unique=True, index=True)
#     expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=15))


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    requisition_id = Column(Integer, ForeignKey("requisitions.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(100), default="general")   # e.g. requisition_created, approval_updated, requisition_deleted
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
    requisition = relationship("Requisitions", back_populates="notifications")


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    to_email = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    status = Column(String(50), default="sent")  # sent, failed, pending
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
