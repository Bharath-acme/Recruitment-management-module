from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey,Text, Boolean,LargeBinary
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

requisition_recruiter = Table(
    "requisition_recruiter",
    Base.metadata,
    Column("requisition_id", Integer, ForeignKey("requisitions.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

# Association Table for Requisitions and Skills (Many-to-Many)
requisition_skills = Table(
    'requisition_skills', Base.metadata,
    Column('requisition_id', Integer, ForeignKey('requisitions.id', ondelete="CASCADE"), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete="CASCADE"), primary_key=True)
)

# Association Table for Candidates and Skills (Many-to-Many)
candidate_skills = Table(
    'candidate_skills', Base.metadata,
    Column('candidate_id', String(36), ForeignKey('candidates.id', ondelete="CASCADE"), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id', ondelete="CASCADE"), primary_key=True)
)

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # Added unique=True
    size = Column(String(100), nullable=True)
    sector = Column(String(200), nullable=True) # Renamed from description
    country = Column(String(100), nullable=False)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    phone_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    client_type = Column(String(50),nullable=True)
    company_agreement = Column(String(50),nullable=True)
    users = relationship("User", back_populates="company_rel")
    requistions= relationship("Requisitions",back_populates="company")
    candidates = relationship("Candidate",back_populates="company")
    interviews = relationship("Interview",back_populates="company")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(100), nullable=False)
    hashed_password = Column(String(100), nullable=False)
    
    # The Link
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company_rel = relationship("Company", back_populates="users")
    # notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    # requisition = relationship("Requisitions", back_populates="user")
    requisitions = relationship("Requisitions", foreign_keys="[Requisitions.recruiter_id]",back_populates="recruiter")
    activity_logs = relationship("RequisitionActivityLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    created_requisitions = relationship("Requisitions",foreign_keys="[Requisitions.created_by]",back_populates="created_by_user")
    hiring_man = relationship("Requisitions",foreign_keys="[Requisitions.hiring_manager_id]", back_populates="hiringManager")

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


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    
    requisitions = relationship("Requisitions", back_populates="department")


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)

    requisitions = relationship("Requisitions", back_populates="location")

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    requisitions = relationship("Requisitions", secondary=requisition_skills, back_populates="skills")
    candidates = relationship("Candidate", secondary=candidate_skills, back_populates="skills")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(100), nullable=False)
    file_data = Column(LargeBinary, nullable=False)  # Binary file content
