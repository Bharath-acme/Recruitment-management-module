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

# --- Database Setup ---
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- PATH LOGIC FOR FRONTEND ASSETS ---
# Assuming app/main.py is in 'backend/app' and the frontend build is in 'frontend/build'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, '..', 'frontend', 'build')
FRONTEND_BUILD_DIR = os.path.abspath(FRONTEND_BUILD_DIR)
FRONTEND_INDEX_FILE = os.path.join(FRONTEND_BUILD_DIR, 'index.html')


# Serve React build
if os.path.exists(FRONTEND_BUILD_DIR) and os.path.exists(FRONTEND_INDEX_FILE):
    print(f"INFO: Frontend build directory found at: {FRONTEND_BUILD_DIR}")
    
    # CRITICAL CHANGE: Mount the entire build directory to the root ("/") 
    # and set html=True. This makes StaticFiles handle the SPA routing:
    # 1. It serves /index.html when / is requested.
    # 2. It serves /assets/index-....js when requested.
    # 3. If a request doesn't match a file (e.g., /candidates), 
    #    it falls back to serving index.html (SPA routing mechanism).
   
    
    # We no longer need the explicit @app.get("/{full_path:path}") fallback 
    # because StaticFiles(html=True) handles it.
else:
    print(f"WARNING: Frontend build directory NOT found at {FRONTEND_BUILD_DIR}. Only API routes will be available.")
    # Provide a simple error message if the frontend is missing.
    @app.get("/", include_in_schema=False, response_class=HTMLResponse)
    async def missing_frontend():
        return """
        <html>
            <head><title>Backend Running</title></head>
            <body>
                <h1>FastAPI Backend is Running</h1>
                <p><strong>Warning:</strong> The Frontend build directory (./frontend/build) was not found.</p>
                <p>Please ensure your deployment process includes building the React application (e.g., running `npm run build` in the frontend directory).</p>
                <p>All API endpoints are active. The build path currently checks: <code>{}</code></p>
            </body>
        </html>
        """.format(FRONTEND_BUILD_DIR)


# --- CORS Middleware ---
origins = [
    "http://localhost:3000",# React dev server
    "http://127.0.0.1:8000", # sometimes React runs here
    "https://acme-recruitment-gyf3fnh3fbdbdka2.canadacentral-01.azurewebsites.net"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
 	allow_methods=["*"],
  	allow_headers=["*"],
)

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
    print('curent user:', current_user)
    if current_user.role.lower() != "hiring_manager":
        raise HTTPException(status_code=403, detail="Not authorized to view team members")
    return db.query(models.User.id, models.User.name).filter(models.User.role == "recruiter").all()


# Include routers for other modules
app.include_router(candidates_api.router, prefix="/candidates", tags=["Candidates"])
app.include_router(requisitions_api.router, prefix="/requisitions", tags=["Requisitions"])
app.include_router(interviews_api.router, prefix="/interviews", tags=["Interviews"])
app.include_router(offers_api.router, prefix="/offers", tags=["Offers"])



 app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="static")


