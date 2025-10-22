from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm,OAuth2PasswordBearer
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from.database import get_db
from app import crud

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

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

