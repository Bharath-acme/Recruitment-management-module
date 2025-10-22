from fastapi import FastAPI, Depends, HTTPException, status, Query, APIRouter
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .schemas import *
from app.auth import oauth2_scheme, get_current_user
from app.database import get_db
from typing import List


router = APIRouter()

def require_roles(*roles):
    def _inner(user = Depends(get_current_user)):
        if user["role"] not in roles and "admin" not in user["role"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
        return user
    return _inner

@router.post("", response_model=OfferOut)
def create_offer(payload: OfferCreate, db: Session = Depends(get_db), user = Depends(require_roles("recruiter", "admin"))):
    # Validate candidate & application exist? (left to integration)
    # create
    offer = crud.create_offer(db, payload, creator_user=user)
    return OfferOut.from_orm(offer)

@router.post("/{offer_id}/submit_for_approval")
def submit_offer_for_approval(offer_id: str, country: str = "IN", db: Session = Depends(get_db), user = Depends(require_roles("recruiter", "admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    res = crud.submit_for_approval(db, offer, country)
    return res

@router.post("/{offer_id}/approvals")
def approver_action(offer_id: str, payload: ApproverAction, db: Session = Depends(get_db), user = Depends(require_roles("finance", "leadership", "hr", "admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    # record approval (role from payload)
    updated = crud.record_approval(db, offer, payload.role, user["id"], payload.action, payload.comment)
    return {"message": "recorded", "offer_status": updated.status.value}

@router.post("/{offer_id}/generate_letter")
def generate_letter(offer_id: str, db: Session = Depends(get_db), user = Depends(require_roles("admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    if offer.status != models.OfferStatus.APPROVED:
        raise HTTPException(400, "offer must be APPROVED to generate letter")
    res = crud.generate_letter(db, offer)
    return res

@router.post("/{offer_id}/candidate_action")
def candidate_action(offer_id: str, payload: CandidateAction, db: Session = Depends(get_db), user = Depends(require_roles("candidate", "admin"))):
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


