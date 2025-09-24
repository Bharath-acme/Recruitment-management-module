from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models, schemas, crud, auth
from app.schemas import LoginRequest
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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = crud.get_user_by_email(db, email=email)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
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
def create_requisition(req: schemas.RequisitionCreate, db: Session = Depends(get_db)):
    return crud.create_requisition(db, req)


@app.get("/requisitions", response_model=list[schemas.RequisitionResponse])
def read_requisitions(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    db_reqs = crud.get_requisitions(db, skip=skip, limit=limit)
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
        # Ensure req_id is always a string (not None)
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
def update_requisition(requisition_id: int, req: schemas.RequisitionUpdate, db: Session = Depends(get_db)):
    db_req = crud.update_requisition(db, requisition_id, req)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_req


@app.delete("/requisitions/{requisition_id}", response_model=schemas.RequisitionResponse)
def delete_requisition(requisition_id: int, db: Session = Depends(get_db)):
    db_req = crud.delete_requisition(db, requisition_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return db_req


# @app.post("/positions", response_model=schemas.PositionResponse)
# def create_position(position: schemas.PositionCreate, db: Session = Depends(get_db)):
#     return crud.create_position(db, position)

@app.post("/positions", response_model=schemas.PositionResponse)
def create_position(position_data: schemas.PositionCreate, db: Session = Depends(get_db)):
    # Convert camelCase to snake_case for ORM
    db_position = models.Position(
        requisition_id=position_data.requisition_id,
        position_name=position_data.positionName,
        skills=",".join(position_data.skills) if isinstance(position_data.skills, list) else position_data.skills,
        position_desc=position_data.position_desc,
        status=position_data.status,
    )
    db.add(db_position)
    db.commit()
    db.refresh(db_position)
    # Return camelCase for frontend
    return {
        "id": db_position.id,
        "requisition_id": db_position.requisition_id,
        "position_name": db_position.position_name,
        "position_desc": db_position.position_desc,
        "skills": p.skills.split(",") if isinstance(p.skills, str) and p.skills else p.skills if isinstance(p.skills, list) else [],
        "status": db_position.status,
    }
# @app.get("/requisitions/{id}/positions", response_model=list[schemas.PositionResponse])
# def list_positions(id: int, db: Session = Depends(get_db)):
#     positions = crud.get_positions_by_requisition(db, id)
#     return [
#         {
#             "id": p.id,
#             "requisition_id": p.requisition_id,
#             "position_name": p.position_name,
#             "skills": p.skills.split(",") if isinstance(p.skills, str) and p.skills else p.skills if isinstance(p.skills, list) else [],
#             "position_desc": p.position_desc,
#             "status": p.status,
#         }
#         for p in positions
#     ]

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
