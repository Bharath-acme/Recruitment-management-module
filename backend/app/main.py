import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, HTMLResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models, schemas, crud, auth
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




# ================== DATABASE SETUP ==================
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
    return {"access_token": access_token, "token_type": "bearer", "user_data": user}


@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    return current_user


@app.get("/recruiter_team", response_model=List[schemas.RecruiterBase])
def get_team_members(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() not in ["hiring_manager", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view team members")
    return db.query(models.User.id, models.User.name).filter(models.User.role == "recruiter").all()


@app.get("/hiring_managers", response_model=List[schemas.RecruiterBase])
def get_hiring_managers(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view hiring managers")
    return db.query(models.User.id, models.User.name).filter(models.User.role == "hiring_manager").all()

@app.websocket("/ws/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await connect_user(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except Exception:
        await disconnect_user(user_id)


@app.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1️⃣ Counts
    open_positions = db.query(Requisitions).filter(Requisitions.status == "open").count()
    active_candidates = db.query(Candidate).filter(Candidate.status == "active").count()
    scheduled_interviews = db.query(Interview).filter(Interview.status == "Scheduled").count()

    # 2️⃣ Recent Requisitions (latest 5)
    recent_requisitions = (
        db.query(Requisitions)
        .order_by(Requisitions.created_date.desc())
        .limit(5)
        .all()
    )

    # 3️⃣ Upcoming Interviews (next 7 days)
    today = datetime.utcnow()
    upcoming_interviews = (
        db.query(Interview)
        .filter(
            Interview.status == "Scheduled",
            Interview.datetime >= today,
            Interview.datetime <= today + timedelta(days=7),
        )
        .order_by(Interview.datetime.asc())
        .limit(5)
        .all()
    )

    # 4️⃣ Pending Approvals
    pending_approvals = (
        db.query(Requisitions)
        .filter(Requisitions.approval_status == "pending")
        .order_by(Requisitions.created_date.desc())
        .limit(5)
        .all()
    )

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



# ================== MODULE ROUTERS ==================
app.include_router(candidates_api.router, prefix="/candidates", tags=["Candidates"])
app.include_router(requisitions_api.router, prefix="/requisitions", tags=["Requisitions"])
app.include_router(interviews_api.router, prefix="/interviews", tags=["Interviews"])
app.include_router(offers_api.router, prefix="/offers", tags=["Offers"])

# ================== FRONTEND PATH SETUP (SIMPLIFIED FIX) ==================
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

# 4️⃣ REMOVE THE EXPLICIT CATCH-ALL ROUTE!
# The `html=True` in StaticFiles now handles the refresh/deep-linking