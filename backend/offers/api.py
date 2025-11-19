from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .schemas import *
from app.auth import oauth2_scheme, get_current_user
from app.database import get_db
from typing import List


router = APIRouter()


def require_roles(*roles):
    def dependency(user=Depends(get_current_user)):
        if not hasattr(user, "role"):
            raise HTTPException(status_code=400, detail="Invalid user object")

        if user.role not in roles and user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized"
            )
        return user
    return Depends(dependency)


@router.get("", response_model=List[OfferOut])
def list_offers(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    status: Optional[str] = None,
    candidate_id: Optional[str] = None
):
    query = db.query(models.Offer)

    if status:
        query = query.filter(models.Offer.status == status)
    if candidate_id:
        query = query.filter(models.Offer.candidate_id == candidate_id)

    offers = query.all()

    # include approvals if needed
    result = []
    for o in offers:
        approvals = (
            db.query(models.ApprovalRecord)
            .filter(models.ApprovalRecord.offer_id == o.id)
            .all()
        )
        offer_out = OfferOut.from_orm(o)
        offer_out.approvals = [
            {"role": a.role, "state": a.state, "approver": a.approver_id, "comment": a.comment}
            for a in approvals
        ]
        result.append(offer_out)

    return result



@router.post("", response_model=OfferOut)
def create_offer(payload: OfferCreate, db: Session = Depends(get_db), user = require_roles("recruiter","hiring_manager", "admin")):
    # Validate candidate & application exist? (left to integration)
    # create
    offer = crud.create_offer(db, payload, creator_user=user)
    return OfferOut.from_orm(offer)

@router.post("/{offer_id}/submit_for_approval")
def submit_offer_for_approval(offer_id: str, country: str = "IN", db: Session = Depends(get_db), user =  require_roles("recruiter","hiring_manager", "admin")):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    res = crud.submit_for_approval(db, offer, country)
    return res

@router.post("/{offer_id}/approvals")
def approver_action(offer_id: str, payload: ApproverAction, db: Session = Depends(get_db), user =  require_roles("recruiter","hiring_manager", "admin")):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    # record approval (role from payload)
    updated = crud.record_approval(db, offer, payload.role, user["id"], payload.action, payload.comment)
    return {"message": "recorded", "offer_status": updated.status.value}

@router.post("/{offer_id}/generate_letter")
def generate_letter(offer_id: str, db: Session = Depends(get_db), user =  require_roles("hiring_manager", "admin")):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    if offer.status != models.OfferStatus.APPROVED:
        raise HTTPException(400, "offer must be APPROVED to generate letter")
    res = crud.generate_letter(db, offer)
    return res

@router.post("/{offer_id}/candidate_action")
def candidate_action(offer_id: str, payload: CandidateAction, db: Session = Depends(get_db), user =  require_roles("recruiter","hiring_manager", "admin")):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    updated = crud.candidate_action(db, offer, payload.action, payload.counter_base, payload.counter_note)
    return {"message": "processed", "status": updated.status.value}

@router.get("/{offer_id}", response_model=OfferOut)
def get_offer(offer_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    return OfferOut.from_orm(offer)


