from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from typing import List, Optional
import random
import sqlalchemy
from sqlalchemy.orm import joinedload

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
    req_id = generate_req_id("acme")
    db_req = models.Requisitions(
        req_id=req_id,
        **req.dict())
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req



def get_requisition(db: Session, requisition_id: int):
    return db.query(models.Requisitions)\
        .options(joinedload(models.Requisitions.candidates))\
        .filter(models.Requisitions.id == requisition_id)\
        .first()


# def get_requisitions(db: Session, skip=0, limit=10):
#     return db.query(models.Requisitions)\
#         .options(joinedload(models.Requisitions.candidates))\
#         .offset(skip).limit(limit).all()

def get_requisitions(
    db: Session,
    skip=0,
    limit=10,
    role: str = None,
    user_id: int = None,
    approval_status: str = None
):
    query = db.query(models.Requisitions).options(joinedload(models.Requisitions.candidates))

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

    # Update fields from schema
    for key, value in req.dict(exclude_unset=True).items():
        setattr(db_req, key, value)

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