from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey
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
    country = Column(String(100), nullable=False)
    hashed_password = Column(String(100), nullable=False)
    requisitions = relationship("Requisitions", back_populates="recruiter")
    activity_logs = relationship("RequisitionActivityLog", back_populates="user", cascade="all, delete-orphan")



