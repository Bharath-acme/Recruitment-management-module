from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from typing import List, Optional
import random
import sqlalchemy
from sqlalchemy.orm import joinedload
from app import crud as skills_crud

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def generate_req_id(company_name: str) -> str:
    # Take first 4 letters of company name
    initials = company_name[:4].upper()
    # Generate two random 3-digit numbers
    part1 = str(random.randint(100, 999))
    part2 = str(random.randint(100, 999))
    return f"{initials}-{part1}-{part2}"


def create_requisition(db: Session, req: schemas.RequisitionCreate):
    skills_data = req.skills
    req_data = req.dict(exclude={"skills"})

    req_id = generate_req_id("AGH")
    db_req = models.Requisitions(req_id=req_id, **req_data)

    if skills_data:
        for skill_name in skills_data:
            skill = skills_crud.get_or_create_skill(db, skill_name=skill_name.strip())
            db_req.skills.append(skill)

    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req



def get_requisition(db: Session, requisition_id: int):
    return (
        db.query(models.Requisitions)
        .options(
            joinedload(models.Requisitions.department),
            joinedload(models.Requisitions.location),
            joinedload(models.Requisitions.skills),
            joinedload(models.Requisitions.candidates),
            joinedload(models.Requisitions.recruiter),
            joinedload(models.Requisitions.company),
        )
        .filter(models.Requisitions.id == requisition_id)
        .first()
    )

def get_requisitions(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    role: Optional[str] = None,
    user_id: Optional[int] = None,
    approval_status: Optional[str] = None,
    company_id: Optional[int] = None,
    company_name: Optional[str] = None,
):
    query = db.query(models.Requisitions).options(
        joinedload(models.Requisitions.department),   # ✅ LOAD department
        joinedload(models.Requisitions.location),     # ✅ LOAD location
        joinedload(models.Requisitions.skills),       # ✅ LOAD skills
        joinedload(models.Requisitions.recruiter),    # ✅ LOAD recruiter
        joinedload(models.Requisitions.candidates),
        joinedload(models.Requisitions.company),   # already there
    )

    # 🏢 Company-based filtering
    if company_name and company_name.lower() != "acme global hub":
        query = query.filter(models.Requisitions.company_id == company_id)

    # ✅ Admin: all (pending + approved + rejected)
    if role == "admin":
        if approval_status == "all":
            query = query.filter(models.Requisitions.approval_status.in_(["pending", "approved", "rejected"]))
        elif approval_status:
            query = query.filter(models.Requisitions.approval_status == approval_status)

    # ✅ Hiring Manager: assigned to them (all statuses)
    elif role == "hiring_manager" and user_id is not None:
        if approval_status == "all":
            query = query.filter(
                # models.Requisitions.hiring_manager_id == user_id,
                models.Requisitions.approval_status.in_(["pending", "approved", "rejected"])
            )
        elif approval_status:
            query = query.filter(
                # models.Requisitions.hiring_manager_id == user_id,
                models.Requisitions.approval_status == approval_status
            )
        else:
            query = query.filter(models.Requisitions.hiring_manager_id == user_id)

    # ✅ Recruiter: assigned to them + approved only
    elif role == "recruiter" and user_id is not None:
        query = query.filter(
            models.Requisitions.recruiter_id == user_id,
            models.Requisitions.approval_status == "approved"
        )

    # ✅ Default fallback
    elif approval_status:
        query = query.filter(models.Requisitions.approval_status == approval_status)

    return query.offset(skip).limit(limit).all()


def update_requisition(db: Session, requisition_id: int, req: schemas.RequisitionUpdate, recruiter_id: Optional[int] = None):
    db_req = db.query(models.Requisitions).filter(models.Requisitions.id == requisition_id).first()
    if not db_req:
        return None

    update_data = req.dict(exclude_unset=True, exclude={"skills"})
    for key, value in update_data.items():
        setattr(db_req, key, value)

    if req.skills is not None:
        db_req.skills.clear()
        for skill_name in req.skills:
            skill = skills_crud.get_or_create_skill(db, skill_name=skill_name.strip())
            db_req.skills.append(skill)

    # Update the recruiter if provided
    if recruiter_id is not None:
        db_req.recruiter_id = recruiter_id

    db.commit()
    db.refresh(db_req)
    return db_req


def delete_requisition(db: Session, requisition_id: int):
    db_req = db.query(models.Requisitions).filter(models.Requisitions.id == requisition_id).first()
    if not db_req:
        return None
    db.delete(db_req)
    db.commit()
    return db_req

def create_position(db: Session, position: schemas.PositionCreate):
    db_position = models.Position(
        requisition_id=position.requisition_id,
        position_name=position.positionName,
        skills=",".join(position.skills),
        position_desc=position.position_desc,
        status=position.status,
    )
    db.add(db_position)
    db.commit()
    db.refresh(db_position)
    return db_position

def get_positions_by_requisition(db: Session, requisition_id: int):
    return db.query(models.Position).filter(models.Position.requisition_id == requisition_id).all()


def create_activity_log(db, requisition_id, user, action, details=None):
    log = models.RequisitionActivityLog(
        requisition_id=requisition_id,
        user_id=user.id,
        username=user.name,
        action=action,
        details=details
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log