from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from .models import Offer, ApprovalRecord, OfferStatus, ApprovalState, SalaryBand, Blob
from datetime import timedelta
# from .notifications import notify_roles
from .schemas import OfferCreate,OfferOut
import uuid
from app.auth import hash_password
from datetime import datetime
from typing import List, Optional
import random

def create_user(db: Session, user: schemas.UserCreate, hashed_pw: str):
    db_user = models.User(
        email=user.email,
        name=user.name,
        role=user.role,
        company=user.company,
        country=user.country,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


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
#======================================= Candidate CRUD operations ======================================

def get_candidate(db: Session, candidate_id: str):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()

def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()

def create_candidate(db: Session, candidate: schemas.CandidateCreate):
    db_candidate = models.Candidate(
        name=candidate.name,
        position=candidate.position,
        email=candidate.email,
        phone=candidate.phone,
        location=candidate.location,
        experience=candidate.experience,
        skills=candidate.skills,
        rating=candidate.rating,
        notes=candidate.notes,
        resume_url=candidate.resume_url,
        recruiter=candidate.recruiter,
        status=candidate.status,
        requisition_id=candidate.requisition_id,
        source=candidate.source,         
        current_ctc=candidate.current_ctc,
        expected_ctc=candidate.expected_ctc,
        notice_period=candidate.notice_period,
        current_company=candidate.current_company,
        dob=candidate.dob,
        marital_status=candidate.marital_status,
        applied_date=datetime.utcnow(),
        last_activity=datetime.utcnow(),
        created_date=datetime.utcnow(),
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def update_candidate(db: Session, candidate_id: str, candidate: schemas.CandidateUpdate):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None
    for key, value in candidate.dict(exclude_unset=True).items():
        setattr(db_candidate, key, value)
    db_candidate.last_activity = datetime.utcnow()
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

def delete_candidate(db: Session, candidate_id: str):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return None
    db.delete(db_candidate)
    db.commit()
    return db_candidate

#======================================= Interview CRUD operations ======================================

def create_interview(db: Session, interview: schemas.InterviewCreate):
    db_interview = models.Interview(
        **interview.dict(exclude={"interviewers"}),
        interviewers=",".join(interview.interviewers)
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    # Serialize response to match InterviewResponse
    interviewers_list = db_interview.interviewers.split(",") if db_interview.interviewers else []
    requisition_id_str = str(db_interview.requisition_id)
    created_date = getattr(db_interview, "created_date", None)
    if not created_date:
        created_date = db_interview.datetime
    req_obj = db_interview.requisition
    req_id = str(getattr(req_obj, "req_id", "")) if req_obj else ""
    recruiter = None
    if req_obj and hasattr(req_obj, "recruiter"):
        recruiter = {
            "id": req_obj.recruiter.id,
            "name": req_obj.recruiter.name,
            "email": req_obj.recruiter.email,
        } if req_obj.recruiter else None
    requisition_dict = {
        **req_obj.__dict__,
        "req_id": req_id,
        "recruiter": recruiter
    } if req_obj else None
    return {
        "id": db_interview.id,
        "candidate_id": db_interview.candidate_id,
        "requisition_id": requisition_id_str,
        "interview_type": db_interview.interview_type,
        "mode": db_interview.mode,
        "datetime": db_interview.datetime,
        "duration": db_interview.duration,
        "location": db_interview.location,
        "meeting_link": db_interview.meeting_link,
        "interviewers": interviewers_list,
        "status": db_interview.status,
        "feedback": db_interview.feedback,
        "score": db_interview.score,
        "notes": db_interview.notes,
        "created_date": created_date,
        "candidate": db_interview.candidate,
        "requisition": requisition_dict
    }

def get_interviews(db: Session):
    interviews = db.query(models.Interview).all()
    result = []
    for interview in interviews:
        # Ensure interviewers is a list
        interviewers = interview.interviewers.split(",") if interview.interviewers else []
        # Ensure requisition_id is a string
        requisition_id = str(interview.requisition_id)
        # Ensure created_date is present
        created_date = getattr(interview, "created_date", None)
        if not created_date:
            created_date = interview.datetime
        req_obj = interview.requisition
        req_id = str(getattr(req_obj, "req_id", "")) if req_obj else ""
        recruiter = None
        if req_obj and hasattr(req_obj, "recruiter"):
            recruiter = {
                "id": req_obj.recruiter.id,
                "name": req_obj.recruiter.name,
                "email": req_obj.recruiter.email,
            } if req_obj.recruiter else None
        requisition_dict = {
            **req_obj.__dict__,
            "req_id": req_id,
            "recruiter": recruiter
        } if req_obj else None
        result.append({
            "id": interview.id,
            "candidate_id": interview.candidate_id,
            "requisition_id": requisition_id,
            "interview_type": interview.interview_type,
            "mode": interview.mode,
            "datetime": interview.datetime,
            "duration": interview.duration,
            "location": interview.location,
            "meeting_link": interview.meeting_link,
            "interviewers": interviewers,
            "status": interview.status,
            "feedback": interview.feedback,
            "score": interview.score,
            "notes": interview.notes,
            "created_date": created_date,
            "candidate": interview.candidate,
            "requisition": requisition_dict
        })
    return result

def get_interview(db: Session, interview_id: str):
    interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not interview:
        return None
    interviewers = interview.interviewers.split(",") if interview.interviewers else []
    requisition_id = str(interview.requisition_id)
    created_date = getattr(interview, "created_date", None)
    if not created_date:
        created_date = interview.datetime
    req_obj = interview.requisition
    req_id = str(getattr(req_obj, "req_id", "")) if req_obj else ""
    recruiter = None
    if req_obj and hasattr(req_obj, "recruiter"):
        recruiter = {
            "id": req_obj.recruiter.id,
            "name": req_obj.recruiter.name,
            "email": req_obj.recruiter.email,
        } if req_obj.recruiter else None
    requisition_dict = {
        **req_obj.__dict__,
        "req_id": req_id,
        "recruiter": recruiter
    } if req_obj else None
    return {
        "id": interview.id,
        "candidate_id": interview.candidate_id,
        "requisition_id": requisition_id,
        "interview_type": interview.interview_type,
        "mode": interview.mode,
        "datetime": interview.datetime,
        "duration": interview.duration,
        "location": interview.location,
        "meeting_link": interview.meeting_link,
        "interviewers": interviewers,
        "status": interview.status,
        "feedback": interview.feedback,
        "score": interview.score,
        "notes": interview.notes,
        "created_date": created_date,
        "candidate": interview.candidate,
        "requisition": requisition_dict
    }

#======================================= Offer CRUD operations ======================================

OUTSIDE_BAND_ROLES = ["finance", "leadership"]
IN_BAND_ROLES = ["hr"]

def get_salary_band(db: Session, country: str, grade: str) -> Optional[SalaryBand]:
    return db.query(SalaryBand).filter(SalaryBand.country == country, SalaryBand.grade == grade).one_or_none()

def is_outside_band(db: Session, country: str, grade: str, base: float) -> bool:
    band = get_salary_band(db, country, grade)
    if not band:
        # if not defined, treat as outside band
        return True
    return not (band.min_amount <= base <= band.max_amount)

def create_approval_records(offer: Offer, roles: List[str]):
    now = datetime.utcnow()
    records = []
    for r in roles:
        rec = ApprovalRecord(offer=offer, role=r, state=ApprovalState.PENDING)
        records.append(rec)
    return records

def create_offer(db: Session, payload: OfferCreate, creator_user=None) -> Offer:
    expiry = datetime.utcnow() + timedelta(days=payload.expiry_days or 14)
    offer = Offer(
        offer_id=str(uuid.uuid4()),
        app_id=payload.app_id,
        candidate_id=payload.candidate_id,
        grade=payload.grade,
        base=payload.base,
        allowances=payload.allowances.dict() if payload.allowances else {},
        benefits=payload.benefits.dict() if payload.benefits else {},
        variable_pay=payload.variable_pay or 0.0,
        currency=payload.currency or "USD",
        expiry_date=expiry,
        status=OfferStatus.DRAFT
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer

def submit_for_approval(db: Session, offer: Offer, country: str = "IN"):
    if offer.status not in (OfferStatus.DRAFT, OfferStatus.REJECTED):
        raise ValueError("Only DRAFT or REJECTED offers can be submitted")

    outside = is_outside_band(db, country, offer.grade, offer.base)
    roles = OUTSIDE_BAND_ROLES if outside else IN_BAND_ROLES

    # create approval records
    for r in roles:
        ar = ApprovalRecord(offer_id=offer.id, role=r, state=ApprovalState.PENDING)
        db.add(ar)
    offer.status = OfferStatus.PENDING_APPROVAL
    db.add(offer)
    db.commit()

    # notify approvers (resolve roles to users in real system)
    notify_roles(roles, f"Offer {offer.offer_id} requires approval", {"offer_id": offer.offer_id})
    return {"outside": outside, "roles": roles}

def record_approval(db: Session, offer: Offer, role: str, approver_user_id: int, action: str, comment: Optional[str] = None):
    # find pending record for this role
    rec = db.query(ApprovalRecord).filter(
        ApprovalRecord.offer_id == offer.id,
        ApprovalRecord.role == role,
        ApprovalRecord.state == ApprovalState.PENDING
    ).first()
    if not rec:
        raise ValueError("No pending approval for this role")

    if action.upper() not in ("APPROVED", "REJECTED"):
        raise ValueError("Invalid action")

    rec.approver_id = approver_user_id
    rec.comment = comment
    rec.acted_at = datetime.utcnow()
    rec.state = ApprovalState.APPROVED if action.upper() == "APPROVED" else ApprovalState.REJECTED
    db.add(rec)
    db.commit()

    # evaluate overall state
    states = [r.state for r in db.query(ApprovalRecord).filter(ApprovalRecord.offer_id == offer.id).all()]
    if any(s == ApprovalState.REJECTED for s in states):
        offer.status = OfferStatus.REJECTED
    elif all(s == ApprovalState.APPROVED for s in states):
        offer.status = OfferStatus.APPROVED
    else:
        offer.status = OfferStatus.PENDING_APPROVAL

    db.add(offer)
    db.commit()
    return offer

def generate_letter(db: Session, offer: Offer):
    # push to celery task to render + upload + send for e-sign
    from .tasks import render_and_send_offer
    render_and_send_offer.delay(offer.id)
    return {"queued": True}

def candidate_action(db: Session, offer: Offer, action: str, counter_base: Optional[float] = None, candidate_note: Optional[str] = None):
    action = action.upper()
    if offer.status not in (OfferStatus.LETTER_GENERATED, OfferStatus.PENDING_APPROVAL):
        raise ValueError("Offer not in a candidate-actionable state")

    if action == "ACCEPT":
        offer.status = OfferStatus.ACCEPTED
    elif action == "DECLINE":
        offer.status = OfferStatus.DECLINED
    elif action == "COUNTER":
        if counter_base is None:
            raise ValueError("counter_base required for COUNTER action")
        offer.base = counter_base
        # re-evaluate approvals
        from .crud import is_outside_band
        outside = is_outside_band(db, "IN", offer.grade, offer.base)
        roles = OUTSIDE_BAND_ROLES if outside else IN_BAND_ROLES
        # delete old approvals and create new ones
        db.query(ApprovalRecord).filter(ApprovalRecord.offer_id == offer.id).delete()
        for r in roles:
            db.add(ApprovalRecord(offer_id=offer.id, role=r, state=ApprovalState.PENDING))
        offer.status = OfferStatus.PENDING_APPROVAL
        notify_roles(roles, f"Counter offer for {offer.offer_id} requires approval", {"offer_id": offer.offer_id})
    else:
        raise ValueError("Unknown action")

    db.add(offer)
    db.commit()
    return offer