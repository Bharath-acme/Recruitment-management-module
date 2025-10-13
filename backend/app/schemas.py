from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
import enum




class RecruiterBase(BaseModel):
    id: int
    name: str
   
    class Config:
        orm_mode = True



class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    company: str
    country: str
    

class UserCreate(UserBase):
    password: str
    confirm_password: str

class UserResponse(UserBase):
    id: int
    # requisitions: List["RequisitionMini"] = [] 
    class Config:
        orm_mode = True
  

class LoginRequest(BaseModel):
    email: str
    password: str

class RecruiterOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True

UserResponse.update_forward_refs()

