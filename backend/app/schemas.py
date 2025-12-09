from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List
import enum


class CompanyBase(BaseModel):
    id: int
    name: str
    country: str
    size: Optional[str] = None
    sector: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    phone_number: Optional[str] = None
    client_type:Optional[str]=None
    company_agreement:Optional[str]=None

    class Config:
        from_attributes = True 
        populate_by_name = True # Allows Pydantic to read ORM attributes/aliases

class CompanyOut(BaseModel):
    id: int
    name: str
    # add other fields you need

    class Config:
        from_attributes = True


class RecruiterBase(BaseModel):
    id: int
    name: str
   
    class Config:
        from_attributes = True



class UserBase(BaseModel):
    # REMOVE: company, country, company_desc, company_size 
    # These details are now handled by the nested CompanyBase in UserResponse

    name: str
    email: EmailStr
    role: str
    # company_id is needed in some schemas, but we'll stick to displaying the data

class UserCreate(UserBase):
    # Keep these fields for user input, as the CRUD logic extracts them to create the Company
    company: str
    country: str
    company_sector: Optional[str] = None
    company_size: Optional[str] = None
    company_address: Optional[str] = None
    company_city: Optional[str] = None
    company_website: Optional[str] = None
    company_phone_number: Optional[str] = None
    client_type:Optional[str]=None
    password: str
    confirm_password: str

class UserResponse(BaseModel): # Changed back to BaseModel for clarity
    id: int
    name: str
    email: EmailStr
    role: str
    
    # 🚨 CRITICAL CHANGE 🚨
    # This maps the SQLAlchemy relationship attribute 'company_rel' 
    # to the desired nested structure defined in CompanyBase.
    # We use an alias to trick the response into having the top-level 'company' field 
    # expected by the frontend, even though the data is nested in the ORM object.
    company_rel: CompanyBase = Field(alias='company')
    
    class Config:
        from_attributes = True 
        populate_by_name = True
  

class LoginRequest(BaseModel):
    email: str
    password: str

class RecruiterOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

UserResponse.update_forward_refs()


class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int

    class Config:
        from_attributes = True

class LocationBase(BaseModel):
    name: str

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    name: str

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    id: int

    class Config:
        orm_mode = True

