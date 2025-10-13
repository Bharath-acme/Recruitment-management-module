from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models, schemas, crud, auth
from app.schemas import LoginRequest, OfferCreate, OfferOut, ApproverAction, CandidateAction
from app.auth import *
from app.database import engine, Base, get_db
from typing import List
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)
# Base.metadata.drop_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",   # React dev server
    "http://127.0.0.1:8000"    # sometimes React runs here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"Home":"Recruitement management module backend application"}

# =============================Authentication============================

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password before saving
    hashed_pw = hash_password(user.password)
    return crud.create_user(db, user, hashed_pw)


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT
    access_token = create_access_token(
                data={
                    "sub": user.email,
                    "id": str(user.id),
                    "role": user.role,
                    "name": user.name,
                    "company": user.company,
                    "country": user.country
                }
            )
    return {"access_token": access_token, "token_type": "bearer","user_data":user}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        print("Decoding token...")  # Debug log
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        print(f"Token payload: {payload}")  # Debug log
        if email is None:
            print("Token missing 'sub' field")  # Debug log
            raise HTTPException(status_code=401, detail="Invalid token")
        user = crud.get_user_by_email(db, email=email)
        if user is None:
            print(f"No user found for email: {email}")  # Debug log
            raise HTTPException(status_code=401, detail="User not found")
        print(f"Authenticated user: {user.email}")  # Debug log
        return user
    except JWTError as e:
        print(f"JWT decoding error: {e}")  # Debug log
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/recruiter_team", response_model=List[schemas.RecruiterBase])
def get_team_members(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    print('Current user role:', current_user.role)
    if current_user.role.lower() != "hiring_manager":
        raise HTTPException(status_code=403, detail="Not authorized to view team members")
    return db.query(models.User.id, models.User.name).filter(models.User.role == "recruiter").all()


# =============================Requisitions============================


@app.post("/create-requisition", response_model=schemas.RequisitionResponse)
def create_requisition(req: schemas.RequisitionCreate, db: Session = Depends(get_db),current_user=Depends(get_current_user)):
    requisition = crud.create_requisition(db, req)
    crud.create_activity_log(
        db,
        requisition_id=requisition.id,
        user=current_user,
        action="Created Requisition",
        details=f"Requisition '{requisition.position}' created by {current_user.name}"
    )

    return requisition
   


@app.get("/requisitions", response_model=list[schemas.RequisitionResponse])
def read_requisitions(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    role: str = Query(None),
    user_id: int = Query(None),
    approval_status: str = Query("approved")
):
    db_reqs = crud.get_requisitions(
        db,
        skip=skip,
        limit=limit,
        role=role,
        user_id=user_id,
        approval_status=approval_status
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

@app.get("/requisitions/{requisition_id}", response_model=schemas.RequisitionResponse)
def read_requisition(requisition_id: int, db: Session = Depends(get_db)):
    db_req = crud.get_requisition(db, requisition_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_req


@app.put("/requisitions/{requisition_id}", response_model=schemas.RequisitionResponse)
def update_requisition(requisition_id: int, req: schemas.RequisitionUpdate, db: Session = Depends(get_db),current_user=Depends(get_current_user)):
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

@app.put("/requisitions/{req_id}/approval")
def update_requisition_approval(
    req_id: int,
    approval_update: schemas.RequisitionApprovalUpdate,
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

    return requisition

@app.put("/requisitions/{req_id}/assignTeam", response_model=schemas.RequisitionResponse)
def update_requisition_team(
    req_id: int,
    team_update: schemas.TeamAssignToRequisition,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.lower() not in ["admin", "hiring_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized to assign recruiters")

    requisition = db.query(models.Requisitions).filter(models.Requisitions.id == req_id).first()
    if not requisition:
        raise HTTPException(status_code=404, detail="Requisition not found")

    if team_update.recruiter_id is not None:
        recruiter = db.query(models.User).filter(
            models.User.id == team_update.recruiter_id,
            models.User.role == "recruiter"
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

    return requisition


@app.delete("/requisitions/{requisition_id}", response_model=schemas.RequisitionResponse)
def delete_requisition(requisition_id: int, db: Session = Depends(get_db)):
    db_req = crud.delete_requisition(db, requisition_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_req


@app.get("/requisitions/{req_id}/activity", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(req_id: int, db: Session = Depends(get_db)):
    logs = db.query(models.RequisitionActivityLog)\
        .filter(models.RequisitionActivityLog.requisition_id == req_id)\
        .order_by(models.RequisitionActivityLog.timestamp.desc())\
        .all()
    return logs


# =============================Candidates============================


@app.post("/create-candidate", response_model=schemas.CandidateResponse)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    return crud.create_candidate(db=db, candidate=candidate)

@app.get("/candidates", response_model=List[schemas.CandidateResponse])
def read_candidates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_candidates(db, skip=skip, limit=limit)

@app.get("/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def read_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate

@app.put("/candidates/{candidate_id}", response_model=schemas.CandidateResponse)
def update_candidate(candidate_id: str, candidate: schemas.CandidateUpdate, db: Session = Depends(get_db)):
    db_candidate = crud.update_candidate(db, candidate_id, candidate)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return db_candidate

@app.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    db_candidate = crud.delete_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"detail": "Candidate deleted successfully"}


# =============================Positions============================

@app.post("/interviews/", response_model=schemas.InterviewResponse)
def create_interview(interview: schemas.InterviewCreate, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == interview.candidate_id).first()
    requisition = db.query(models.Requisitions).filter(models.Requisitions.id == interview.requisition_id).first()

    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate not found")
    if not requisition:
        raise HTTPException(status_code=400, detail="Requisition not found")

    return crud.create_interview(db, interview)

@app.get("/interviews/", response_model=List[schemas.InterviewResponse])
def list_interviews(db: Session = Depends(get_db)):
    return crud.get_interviews(db)

@app.get("/interviews/{interview_id}", response_model=schemas.InterviewResponse)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    db_interview = crud.get_interview(db, interview_id)
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return db_interview

# =============================Offers============================


def require_roles(*roles):
    def _inner(user = Depends(get_current_user)):
        if user["role"] not in roles and "admin" not in user["role"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="forbidden")
        return user
    return _inner

@app.post("/offers", response_model=OfferOut)
def create_offer(payload: OfferCreate, db: Session = Depends(get_db), user = Depends(require_roles("recruiter", "admin"))):
    # Validate candidate & application exist? (left to integration)
    # create
    offer = crud.create_offer(db, payload, creator_user=user)
    return OfferOut.from_orm(offer)

@app.post("/offers/{offer_id}/submit_for_approval")
def submit_offer_for_approval(offer_id: str, country: str = "IN", db: Session = Depends(get_db), user = Depends(require_roles("recruiter", "admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    res = crud.submit_for_approval(db, offer, country)
    return res

@app.post("/offers/{offer_id}/approvals")
def approver_action(offer_id: str, payload: ApproverAction, db: Session = Depends(get_db), user = Depends(require_roles("finance", "leadership", "hr", "admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    # record approval (role from payload)
    updated = crud.record_approval(db, offer, payload.role, user["id"], payload.action, payload.comment)
    return {"message": "recorded", "offer_status": updated.status.value}

@app.post("/offers/{offer_id}/generate_letter")
def generate_letter(offer_id: str, db: Session = Depends(get_db), user = Depends(require_roles("admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    if offer.status != models.OfferStatus.APPROVED:
        raise HTTPException(400, "offer must be APPROVED to generate letter")
    res = crud.generate_letter(db, offer)
    return res

@app.post("/offers/{offer_id}/candidate_action")
def candidate_action(offer_id: str, payload: CandidateAction, db: Session = Depends(get_db), user = Depends(require_roles("candidate", "admin"))):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    updated = crud.candidate_action(db, offer, payload.action, payload.counter_base, payload.counter_note)
    return {"message": "processed", "status": updated.status.value}

@app.get("/offers/{offer_id}", response_model=OfferOut)
def get_offer(offer_id: str, db: Session = Depends(get_db), user = Depends(get_current_user)):
    offer = db.query(models.Offer).filter(models.Offer.offer_id == offer_id).one_or_none()
    if not offer:
        raise HTTPException(404, "offer not found")
    return OfferOut.from_orm(offer)