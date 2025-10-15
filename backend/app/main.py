import os
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles # Needed for app.mount
from starlette.responses import FileResponse # Needed for serve_react()
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


Base.metadata.create_all(bind=engine)
# Base.metadata.drop_all(bind=engine)

app = FastAPI()

# --- PATH LOGIC FOR FRONTEND ASSETS ---
# Assuming app/main.py is in 'backend/app' and the frontend build is in 'frontend/build' 
# relative to the repository root on the server.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Go up out of 'app', up out of 'backend', then into 'frontend/build'
FRONTEND_BUILD_DIR = os.path.join(BASE_DIR, '..', '..', 'frontend', 'build')

# Serve React build (REVISED MOUNT POINT)
try:
    if os.path.exists(FRONTEND_BUILD_DIR):
        # IMPORTANT: We are mounting the *entire* build directory to the / path 
        # using the StaticFiles method, which catches all requests for static assets 
        # that don't match a defined API route. This is the best way to handle 
        # frontend frameworks that assume assets are at the root (e.g., /js/app.js).
        app.mount("/", StaticFiles(directory=FRONTEND_BUILD_DIR, html=True), name="static")
    else:
        # If the build folder is not found, we print a warning.
        print(f"Warning: Frontend build directory not found at {FRONTEND_BUILD_DIR}. Cannot serve static files.")
except Exception as e:
    print(f"Error mounting static files: {e}")

# The FileResponse route is now REDUNDANT because the StaticFiles mount with html=True 
# automatically serves index.html for the root path (/) when no other file is requested.
# I will leave the old function commented out for reference, but it's no longer necessary.

# @app.get("/", include_in_schema=False)
# def serve_react():
#     # 2. Serve the main index.html file
#     index_file_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
#     
#     if os.path.exists(index_file_path):
#         return FileResponse(index_file_path, media_type="text/html")
#     
#     # Fallback to a custom message if the file is missing (helpful for debugging)
#     return {"message": f"Frontend index.html not found. Check deployment path: {FRONTEND_BUILD_DIR}"}


origins = [
    "http://localhost:3000",# React dev server
    "http://127.0.0.1:8000" # sometimes React runs here
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


@app.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/recruiter_team", response_model=List[schemas.RecruiterBase])
def get_team_members(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    print('Current user role:', current_user.role)
    if current_user.role.lower() != "hiring_manager":
        raise HTTPException(status_code=403, detail="Not authorized to view team members")
    return db.query(models.User.id, models.User.name).filter(models.User.role == "recruiter").all()

# Include routers for other modules
app.include_router(candidates_api.router, prefix="/candidates", tags=["Candidates"])
app.include_router(requisitions_api.router, prefix="/requisitions", tags=["Requisitions"])
app.include_router(interviews_api.router, prefix="/interviews", tags=["Interviews"])
app.include_router(offers_api.router, prefix="/offers", tags=["Offers"])
