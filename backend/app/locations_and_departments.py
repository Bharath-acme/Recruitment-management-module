from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import schemas, models
from .database import get_db

router = APIRouter()

# --- Department CRUD ---

@router.post("/departments", response_model=schemas.Department)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    db_department = db.query(models.Department).filter(models.Department.name == department.name).first()
    if db_department:
        raise HTTPException(status_code=400, detail="Department already exists")
    new_department = models.Department(name=department.name)
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department

@router.get("/departments", response_model=List[schemas.Department])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    departments = db.query(models.Department).offset(skip).limit(limit).all()
    return departments

# --- Location CRUD ---

@router.post("/locations", response_model=schemas.Location)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    db_location = db.query(models.Location).filter(models.Location.name == location.name).first()
    if db_location:
        raise HTTPException(status_code=400, detail="Location already exists")
    new_location = models.Location(name=location.name)
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location

@router.get("/locations", response_model=List[schemas.Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = db.query(models.Location).offset(skip).limit(limit).all()
    return locations
