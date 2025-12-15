from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from .schemas import *
from . import crud, models
from app.models import User
from app.auth import get_current_user
from app.database import get_db
from typing import List, Optional
from fastapi import APIRouter
from app import celery_worker, websocket
from app.utils.tasks import( send_requisition_created_email,
                                send_requisition_approval_email,
                                send_hiring_manager_assigned_email,
                                send_recruiter_assigned_email)
from app.crud import create_notification
from app.utils.notifier import send_requisition_for_approval, send_requisition_approval_update, send_requisition_deleted, send_team_assignment_notification
# from celery.results import AsyncResult


router = APIRouter()

@router.post("", response_model=RequisitionResponse)
async def create_requisition(req: RequisitionCreate, 
                             db: Session = Depends(get_db),
                             current_user=Depends(get_current_user)):

    requisition = crud.create_requisition(db, req)

    crud.create_activity_log(
        db,
        requisition_id=requisition.id,
        user=current_user,
        action="Created Requisition",
        details=f"Requisition '{requisition.position}' created by {current_user.name}"
    )

    # 🔥 Send email notification to sales
    try:
        # send_requisition_created_email.delay(
        #     requisition.id,
        #     requisition.position,
        #     current_user.name
        # )

         send_requisition_created_email(
            requisition.id,
            requisition.position,
            current_user.name
        )
    except Exception:
        print("Celery connection failed:", str(e))

    # Your existing approval workflow
    # try:
    #     send_requisition_for_approval.delay(requisition.id, current_user.id)
    # except Exception:
    #     pass

    return requisition



@router.get("", response_model=list[RequisitionList])
def read_requisitions(
    skip: int = 0,
    limit: int = 10,
    approval_status: str = Query("approved"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):
    db_reqs = crud.get_requisitions(
        db=db,
        skip=skip,
        limit=limit,
        role=current_user.role,
        user_id=current_user.id,
        approval_status=approval_status,
        
        # 🔥 Always pass server-trusted values
        company_id=current_user.company_rel.id,
        company_name=current_user.company_rel.name,
    )

    result = []
    for req in db_reqs:
        recruiter = None
        if req.recruiter:
            recruiter = {
                "id": req.recruiter.id,
                "name": req.recruiter.name,
                "email": req.recruiter.email,
            }

        req_dict = req.__dict__.copy()
        req_dict["recruiter"] = recruiter
        req_dict.pop("_sa_instance_state", None)
        req_dict["req_id"] = str(req_dict.get("req_id") or "")
        result.append(req_dict)

    return result

@router.get("/req", response_model=list[RequisitionMini])
def get_req(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    approval_status: str = Query("approved")
):
    db_reqs = crud.get_requisitions(
        db,
        skip=skip,
        limit=limit,
        role=current_user.role,
        user_id=current_user.id,
        approval_status=approval_status,
    )

    return db_reqs

@router.get("/{requisition_id}", response_model=RequisitionResponse)
def read_requisition(requisition_id: int, db: Session = Depends(get_db)):
    db_req = crud.get_requisition(db, requisition_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_req


@router.put("/{requisition_id}", response_model=RequisitionResponse)
def update_requisition(requisition_id: int, req: RequisitionUpdate, db: Session = Depends(get_db),current_user=Depends(get_current_user)):
    db_req = db.query(models.Requisitions).filter(models.Requisitions.id == requisition_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")

    # ✅ Check differences BEFORE updating
    changes = []
    for field, new_value in req.dict(exclude_unset=True).items():
        old_value = getattr(db_req, field)
        if old_value != new_value:
            changes.append(f"{field} changed from '{old_value}' to '{new_value}'")

    # ✅ Now actually update it
    updated_req = crud.update_requisition(db, requisition_id, req)

    # ✅ Log activity if any field changed
    if changes:
        crud.create_activity_log(
            db=db,
            requisition_id=db_req.id,
            user=current_user,
            action="Updated Requisition",
            details="; ".join(changes)
        )

    return updated_req

@router.put("/{req_id}/approval")
def update_requisition_approval(
    req_id: int,
    approval_update: RequisitionApprovalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1️ Fetch requisition
    requisition = db.query(models.Requisitions).filter(models.Requisitions.id == req_id).first()
    if not requisition:
        raise HTTPException(status_code=404, detail="Requisition not found")

    # 2️ Update approval status
    old_status = requisition.approval_status
    requisition.approval_status = approval_update.approval_status
    db.commit()
    db.refresh(requisition)

    crud.create_activity_log(
        db=db,
        requisition_id=requisition.id,
        user=current_user,
        action="Approval Status Updated",
        details=f"Changed from '{old_status}' to '{approval_update.approval_status}'"
    )
    # try:
    #     send_requisition_approval_update.delay(requisition.id, current_user.id)
    # except Exception:
    #     pass

    try:
        status_text = approval_update.approval_status
        client_email = "bharathvd01@gmail.com"  # TODO: replace with actual client email field

        # send_requisition_approval_email.delay(
        #     requisition.id,
        #     requisition.position,
        #     status_text,
        #     client_email
        # )
         send_requisition_approval_email(
            requisition.id,
            requisition.position,
            status_text,
            client_email
        )
    except Exception as e:
        print("Failed to send approval email:", e)

    return requisition

@router.put("/{req_id}/assignTeam", response_model=RequisitionResponse)
def update_requisition_team(
    req_id: int,
    team_update: TeamAssignToRequisition,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.lower() not in ["admin", "hiring_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to assign recruiters")

    requisition = db.query(models.Requisitions).filter(models.Requisitions.id == req_id).first()
    if not requisition:
        raise HTTPException(status_code=404, detail="Requisition not found")

    if team_update.recruiter_id is not None:
        recruiter = db.query(User).filter(
            User.id == team_update.recruiter_id,
            User.role == "recruiter"
        ).first()
       
        if not recruiter:
            raise HTTPException(status_code=400, detail="Invalid recruiter ID")
        requisition.recruiter_id = team_update.recruiter_id

    db.commit()
    db.refresh(requisition)

     # 🔹 Log recruiter assignment
    crud.create_activity_log(
        db=db,
        requisition_id=requisition.id,
        user=current_user,
        action="Assigned Recruiter",
        details=f"Recruiter ID {requisition.recruiter_id} assigned by {current_user.name}"
    )
    # try:
    #     send_team_assignment_notification.delay(requisition.id, requisition.recruiter_id)
    # except Exception:
    #     pass

    try:
        # send_recruiter_assigned_email.delay(
        #     requisition.id,
        #     requisition.position,
        #     recruiter.email
        # )

        send_recruiter_assigned_email(
            requisition.id,
            requisition.position,
            recruiter.email
        )

        # send_hiring_manager_assigned_email.delay(
        #     requisition.id,
        #     requisition.position,
        #     hiring_manager.email
        # )
    except Exception as e:
        print("Recruiter email failed:", e)

    return requisition


@router.delete("/{requisition_id}", response_model=RequisitionResponse)
def delete_requisition(requisition_id: int, db: Session = Depends(get_db)):
    db_req = crud.delete_requisition(db, requisition_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    # try:
    #     send_requisition_deleted.delay(db_req.id)
    # except Exception:
    #     pass
    return db_req


@router.get("/{req_id}/activity", response_model=List[ActivityLogResponse])
def get_activity_logs(req_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.RequisitionActivityLog)\
        .filter(models.RequisitionActivityLog.requisition_id == req_id)\
        .order_by(models.RequisitionActivityLog.timestamp.desc())\
        .all()
    return logs

