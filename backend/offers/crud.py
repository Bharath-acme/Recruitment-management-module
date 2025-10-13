from sqlalchemy.orm import Session
from app import models, schemas
from .models import Offer, OfferStatus, ApprovalRecord, ApprovalState, SalaryBand
from .schemas import OfferCreate

from datetime import datetime
from typing import List, Optional

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