# FILE: app/main.py
"""
Fixed main.py: removed automatic Base.metadata.create_all from production startup.
This file will only create tables automatically if the environment variable
RUN_CREATE_ALL is set to a truthy value ("1", "true", "yes", or "local") —
useful for local development only.

In production, run Alembic migrations separately (recommended):
    alembic revision --autogenerate -m "..."
    alembic upgrade head

Do NOT run RUN_CREATE_ALL=true in production.
"""
import os
from fastapi import FastAPI, Depends, HTTPException, Query, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, HTMLResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models, schemas, crud, auth
# from .models import *  # avoid star imports
from app.schemas import LoginRequest, UserCreate
from app.auth import *
from app.database import engine, Base, get_db
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from candidates import api as candidates_api
from requisitions import api as requisitions_api
from interviews import api as interviews_api
from offers import api as offers_api
from datetime import datetime, timedelta
from fastapi import FastAPI, WebSocket, Depends
from app.websocket import connect_user, disconnect_user
from requisitions.models import Requisitions
from candidates.models import Candidate 
from interviews.models import Interview
from invoices import api as invoice_api
from app import locations_and_departments



# ================== DATABASE SETUP ==================
# IMPORTANT: Do NOT run Base.metadata.create_all() in production.
# If you need to create tables automatically for local development,
# set the environment variable RUN_CREATE_ALL to a truthy value.
RUN_CREATE_ALL = os.getenv("RUN_CREATE_ALL", "false").lower() in ("1", "true", "yes", "local")
if RUN_CREATE_ALL:
    # Only for local/dev use. In production use Alembic migrations.
    Base.metadata.create_all(bind=engine)

app = FastAPI()

# ================== CORS SETUP ==================
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "https://acme-recruitment-gyf3fnh3fbdbdka2.canadacentral-01.azurewebsites.net"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== AUTH & USER LOGIC ==================
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

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

    hashed_pw = hash_password(user.password)
    return crud.create_user(db, user, hashed_pw)


@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Access company details via the relationship (company_rel)
    company_rel = user.company_rel
    company_name = company_rel.name if company_rel else ""
    company_country = company_rel.country if company_rel else ""
    company_size = company_rel.size if company_rel else ""
    company_desc = company_rel.sector if company_rel else ""
    
    # Initialize the list of all companies
    all_companies_list = []
    
    # 🌟 NEW LOGIC: Check if the user is from 'Acme Global'
    if company_name.lower() == "acme global hub": # Case-insensitive check
        # Fetch all companies and convert them to a simple list of dicts
        # Assumes the Company model is available via models.Company
        all_companies = db.query(models.Company).all()
        
        # Structure the output data
        all_companies_list = [
            {
                "id": c.id,
                "name": c.name,
                "country": c.country,
                "size": c.size,
                "client_type": c.client_type,
                "company_agreement": c.company_agreement
            }
            for c in all_companies
        ]

    # Create JWT (This part remains the same)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "id": str(user.id),
            "role": user.role,
            "name": user.name,
            "company": company_name,
            "country": company_country,
            "company_size": company_size,
            "company_desc": company_desc,
            "company_id": user.company_id
        }
    )
    
    # Return both user data and the list of companies (if applicable)
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_data": user, 
        "all_companies": all_companies_list # 🌟 ADDED THIS FIELD
    }


@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/companies", response_model=List[schemas.CompanyBase])
def get_companies(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    companies = db.query(models.Company).all()
    return companies

@app.get("/recruiter_team", response_model=List[schemas.RecruiterOut])
def get_team_members(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() not in ["hiring_manager", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view team members")
    return db.query(models.User).filter(models.User.role == "recruiter").all()


@app.get("/hiring_managers", response_model=List[schemas.RecruiterOut])
def get_hiring_managers(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view hiring managers")
    return db.query(models.User).filter(models.User.role == "hiring_manager").all()

@app.get("/interviewers", response_model=List[schemas.RecruiterOut])
def get_interviewers(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() not in ["admin", "recruiter", "hiring_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.User).filter(models.User.role == "interviewer").all()

@app.put("/companies/{company_id}/agreement")
async def upload_company_agreement(
    company_id: int,
    agreement: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Authorization check
    if not current_user.role.lower() in ["admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get company
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Save the file
    file_location = f"uploads/agreement_{company_id}_{agreement.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(agreement.file.read())

    # Update company record
    company.company_agreement = file_location
    db.commit()
    db.refresh(company)

    return {"info": f"File '{agreement.filename}' uploaded and linked to {company.name}", "file_path": file_location}


@app.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await connect_user(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except Exception:
        await disconnect_user(user_id)


@app.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    company_id: int = Query(None)
):
    target_company_id = None
    # Use a safer way to access company name
    is_acme_user = current_user.company_rel and current_user.company_rel.name.lower() == 'acme global hub'

    if is_acme_user:
        if company_id:
            target_company_id = company_id
        # If company_id is not provided for ACME user, target_company_id remains None,
        # which will result in global counts (no company filter applied).
    else:
        # For non-ACME users, filter by their own company
        target_company_id = current_user.company_id

    # Base queries
    open_positions_query = db.query(Requisitions).filter(Requisitions.status == "open")
    active_candidates_query = db.query(Candidate).filter(Candidate.status == "new")
    scheduled_interviews_query = db.query(Interview).filter(Interview.status == "Scheduled")
    recent_requisitions_query = db.query(Requisitions).order_by(Requisitions.created_date.desc())
    today = datetime.utcnow()
    upcoming_interviews_query = db.query(Interview).filter(
            Interview.status == "Scheduled",
            Interview.scheduled_at >= today,
            Interview.scheduled_at <= today + timedelta(days=7),
        ).order_by(Interview.scheduled_at.asc())
    pending_approvals_query = db.query(Requisitions).filter(Requisitions.approval_status == "pending").order_by(Requisitions.created_date.desc())


    if target_company_id:
        open_positions_query = open_positions_query.filter(Requisitions.company_id == target_company_id)
        active_candidates_query = active_candidates_query.filter(Candidate.company_id == target_company_id)
        scheduled_interviews_query = scheduled_interviews_query.filter(Interview.company_id == target_company_id)
        recent_requisitions_query = recent_requisitions_query.filter(Requisitions.company_id == target_company_id)
        upcoming_interviews_query = upcoming_interviews_query.filter(Interview.company_id == target_company_id)
        pending_approvals_query = pending_approvals_query.filter(Requisitions.company_id == target_company_id)

    # Execute queries
    open_positions = open_positions_query.count()
    active_candidates = active_candidates_query.count()
    scheduled_interviews = scheduled_interviews_query.count()
    recent_requisitions = recent_requisitions_query.limit(5).all()
    upcoming_interviews = upcoming_interviews_query.limit(5).all()
    pending_approvals = pending_approvals_query.limit(5).all()

    return {
        "summary": {
            "open_positions": open_positions,
            "active_candidates": active_candidates,
            "scheduled_interviews": scheduled_interviews,
        },
        "recent_requisitions": [
            {"id": r.id, 
            "position": r.position, 
            "status": r.status, 
            "created_date": r.created_date, 
            'department': r.department,
            'priority':r.priority,
            'req_id':r.req_id,
            'applications_count': len(r.candidates),

            }
            for r in recent_requisitions
        ],
        "upcoming_interviews": [
            {"id": i.id, "candidate_id": i.candidate_id, "scheduled_date": i.datetime}
            for i in upcoming_interviews
        ],
        "pending_approvals": [
            {"id": p.id, "position": p.position, "created_date": p.created_date, 'req_id':p.req_id, }
            for p in pending_approvals
        ],
    }


@app.get("/skills", response_model=List[schemas.Skill])
def read_skills(q: str = "", db: Session = Depends(get_db)):
    """
    Search for skills.
    """
    if not q:
        skills = crud.get_all_skills(db)
        return skills
    skills = crud.search_skills(db, query=q)
    return skills

@app.post("/skills", response_model=schemas.Skill)
def create_skill(
    skill: schemas.SkillCreate, 
    db: Session = Depends(get_db)
):

    # The CRUD logic is already available via crud.create_skill or similar
    db_skill = db.query(models.Skill).filter(models.Skill.name == skill.name).first()
    if db_skill:
        raise HTTPException(status_code=400, detail="Skill already exists")
    
    new_skill = models.Skill(name=skill.name)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill


@app.post("/departments", response_model=schemas.Department)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_department = db.query(models.Department).filter(models.Department.name == department.name).first()
    if db_department:
        raise HTTPException(status_code=400, detail="Department already exists")
    new_department = models.Department(name=department.name)
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department

@app.get("/departments", response_model=List[schemas.Department])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    departments = db.query(models.Department).offset(skip).limit(limit).all()
    return departments

# --- Location CRUD ---

@app.post("/locations", response_model=schemas.Location)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.name == location.name).first()
    if db_location:
        raise HTTPException(status_code=400, detail="Location already exists")
    new_location = models.Location(name=location.name)
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@app.get("/locations", response_model=List[schemas.Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = db.query(models.Location).offset(skip).limit(limit).all()
    return locations


# ================== MODULE ROUTERS ==================
app.include_router(candidates_api.router, prefix="/candidates", tags=["Candidates"])
app.include_router(requisitions_api.router, prefix="/requisitions", tags=["Requisitions"])
app.include_router(interviews_api.router, prefix="/interviews", tags=["Interviews"])
app.include_router(offers_api.router, prefix="/offers", tags=["Offers"])
app.include_router(invoice_api.router, prefix="/invoices", tags=["Invoices"])
app.include_router(locations_and_departments.router, prefix="/list", tags=["Departments & Locations"])


# ================== FRONTEND PATH SETUP (SIMPLIFIED FIX) ==================
# 🟢 Create the directory if it doesn't exist
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# 🟢 MOUNT THE DIRECTORY
# This makes http://localhost:8000/uploads/filename.pdf accessible
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/pdfs", StaticFiles(directory="pdfs"), name="pdfs")
# 1️⃣ Define frontend build directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'build'))
FRONTEND_INDEX_FILE = os.path.join(FRONTEND_BUILD_DIR, 'index.html')

# 2️⃣ Debug info (optional)
if os.path.exists(FRONTEND_BUILD_DIR) and os.path.exists(FRONTEND_INDEX_FILE):
    print(f"✅ Frontend build directory found: {FRONTEND_BUILD_DIR}")
else:
    print(f"⚠️ Frontend build directory not found at {FRONTEND_BUILD_DIR}")

# 3️⃣ Mount React static files (This should be the LAST mount/route)
if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="frontend")
else:
    # Fallback for the root path if the build directory is missing
    @app.get("/", include_in_schema=False)
    async def frontend_missing_fallback():
        return HTMLResponse("<h2>Frontend build not found. Run `npm run build` in frontend/</h2>")

# NOTE: No explicit catch-all route — StaticFiles(html=True) handles deep-links.



