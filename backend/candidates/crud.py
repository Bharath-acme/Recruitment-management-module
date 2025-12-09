from sqlalchemy.orm import Session,joinedload
from fastapi import HTTPException,UploadFile
from datetime import datetime, date
from typing import Optional
from . import models, schemas
from requisitions import models as requisition_models
from app.models import User 
from app.auth import get_current_user
from app import crud as skills_crud
import os 

UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)




def create_candidate_service(db: Session, data: dict, resume: UploadFile, resume_path: str, current_user: User):
    # 1) Check if candidate exists
    existing = db.query(models.Candidate).filter(models.Candidate.email == data["email"]).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Candidate with email {data['email']} already exists")

    # 2) Get company from requisition
    req = db.query(requisition_models.Requisitions).filter(
        requisition_models.Requisitions.id == data["requisition_id"]
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")

    company_id = req.company_id

    # 3) Determine final resume path
    final_resume_url = None

    if resume:
        file_location = os.path.join(UPLOAD_DIR, resume.filename)

        with open(file_location, "wb") as f:
            f.write(resume.file.read())

        final_resume_url = file_location

    elif resume_path:
        # keep old resume
        final_resume_url = resume_path

    # 4) Create DB candidate
    skills_list = data.pop("skills", [])
    data.pop("company_id", None)


    candidate = models.Candidate(**data, company_id=company_id)

    # assign skills
    for s in skills_list:
        skill = skills_crud.get_or_create_skill(db, s.strip())
        candidate.skills.append(skill)

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # 5) insert into File table if resume exists
    if final_resume_url:
        file_entry = models.File(
            file_name=f"{candidate.name}_resume",
            file_type="resume",
            file_url=final_resume_url,
            candidate_id=candidate.id
        )
        db.add(file_entry)
        db.commit()

    return candidate


def get_candidate(db: Session, candidate_id: str):
    return db.query(models.Candidate).options(joinedload(models.Candidate.skills)).options(joinedload(models.Candidate.files)).filter(models.Candidate.id == candidate_id).first()


def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).options(joinedload(models.Candidate.skills)).offset(skip).limit(limit).all()


# def create_candidate(db: Session, candidate: schemas.CandidateCreate, current_user: User):
#     # ✅ Check if candidate already exists
#     existing_candidate = db.query(models.Candidate).filter(
#         models.Candidate.email == candidate.email
#     ).first()
#     if existing_candidate:
#         raise HTTPException(status_code=400, detail=f"Candidate with email '{candidate.email}' already exists.")

#     # ✅ Get company_id from requisition
#     if not candidate.requisition_id:
#         raise HTTPException(status_code=400, detail="Requisition ID is required to create a candidate.")
        
#     requisition = db.query(requisition_models.Requisitions).filter(requisition_models.Requisitions.id == candidate.requisition_id).first()
#     if not requisition:
#         raise HTTPException(status_code=404, detail="Requisition not found")
    
#     company_id = requisition.company_id

#     # ✅ Create candidate
#     skills_names = candidate.skills
#     candidate_data = candidate.dict(exclude={'skills'})
    
#     db_candidate = models.Candidate(**candidate_data, company_id=company_id)

#     if skills_names:
#         for skill_name in skills_names:
#             skill = skills_crud.get_or_create_skill(db, skill_name=skill_name.strip())
#             db_candidate.skills.append(skill)

#     try:
#         db.add(db_candidate)
#         db.commit()
#         db.refresh(db_candidate)

#         # ✅ Save resume record (if available)
#         if candidate.resume_url:
#             file_entry = models.File(
#                 file_name=f"{candidate.name}_resume",
#                 file_type="resume",
#                 file_url=candidate.resume_url,
#                 candidate_id=db_candidate.id,
#                 # uploaded_by=current_user.name,
#             )
#             db.add(file_entry)
#             db.commit()

#         # ✅ Log creation
#         create_candidate_activity_log(
#             db=db,
#             candidate_id=db_candidate.id,
#             user=current_user,
#             action="Created Candidate",
#             details=f"Candidate '{db_candidate.name}' created."
#         )

#         return db_candidate

#     except Exception as e:
#         db.rollback()
#         print(f"❌ Error creating candidate: {e}")
#         raise HTTPException(status_code=500, detail="Error creating candidate")


def clean_dict(data: dict) -> dict:
    cleaned_data = {}
    for key, value in data.items():
        if key == "_sa_instance_state":
            continue
        if isinstance(value, (date, datetime)):
            cleaned_data[key] = value.isoformat()
        else:
            cleaned_data[key] = value
    return cleaned_data


# def update_candidate(db: Session, candidate_id: str, candidate: schemas.CandidateUpdate, current_user: User):
#     db_candidate = get_candidate(db, candidate_id)
#     if not db_candidate:
#         raise HTTPException(status_code=404, detail="Candidate not found")

#     old_data = clean_dict(db_candidate.__dict__.copy())
#     changes = []

#     update_data = candidate.dict(exclude_unset=True)
    
#     if 'skills' in update_data:
#         skill_names = update_data.pop('skills')
#         old_skills = [s.name for s in db_candidate.skills]
#         if set(old_skills) != set(skill_names):
#              changes.append(f"Skills changed from '{', '.join(old_skills)}' to '{', '.join(skill_names)}'")
#              db_candidate.skills.clear()
#              for skill_name in skill_names:
#                 skill = skills_crud.get_or_create_skill(db, skill_name=skill_name.strip())
#                 db_candidate.skills.append(skill)

#     for field, new_value in update_data.items():
#         old_value = getattr(db_candidate, field)
#         if old_value != new_value:
#             changes.append(f"{field} changed from '{old_value}' to '{new_value}'")
#             setattr(db_candidate, field, new_value)

#     db_candidate.last_activity = datetime.utcnow()
#     db.commit()
#     db.refresh(db_candidate)

#     # ✅ Handle resume update (no parsing)
#     if candidate.resume_url:
#         existing_file = (
#             db.query(models.File)
#             .filter(models.File.candidate_id == candidate_id, models.File.file_type == "resume")
#             .first()
#         )

#         if existing_file:
#             existing_file.file_url = candidate.resume_url
#             existing_file.uploaded_at = datetime.utcnow()
#         else:
#             new_file = models.File(
#                 file_name=f"{db_candidate.name}_resume",
#                 file_type="resume",
#                 file_url=candidate.resume_url,
#                 candidate_id=db_candidate.id,
#                 # uploaded_by=current_user.name,
#             )
#             db.add(new_file)
#         db.commit()

#     if changes:
#         create_candidate_activity_log(
#             db=db,
#             candidate_id=candidate_id,
#             user=current_user,
#             action="Updated Candidate",
#             details="; ".join(changes),
#         )

#     return db_candidate


# In crud.py

def update_candidate_service(db: Session, candidate_id: str, data: dict, resume: UploadFile, current_user: User):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 1. Handle Skills (Pop them out of data dict first)
    if 'skills' in data:
        skill_names = data.pop('skills')
        # Clear existing and re-add
        db_candidate.skills = [] 
        for skill_name in skill_names:
            skill = skills_crud.get_or_create_skill(db, skill_name=skill_name.strip())
            db_candidate.skills.append(skill)

    # 2. Handle Resume File Upload
    final_resume_url = None
    if resume:
        # Save new file
        file_location = os.path.join(UPLOAD_DIR, resume.filename)
        with open(file_location, "wb") as f:
            f.write(resume.file.read())
        final_resume_url = file_location
        data['resume_url'] = final_resume_url # Update candidate table reference
    
    elif 'resume_path' in data:
        # If user didn't upload a new file, but passed the old path string
        # We don't need to do anything, or we can update it if it changed
        pass

    # 3. Update Standard Fields
    # Remove resume_path from data as it's not a column in Candidate table
    data.pop('resume_path', None)

    for key, value in data.items():
        if hasattr(db_candidate, key):
             # basic type conversion for Dates if strictly needed
            if key == 'dob' and isinstance(value, str):
                try:
                    value = datetime.strptime(value, "%Y-%m-%d").date()
                except:
                    pass # Keep as is or handle error
            
            setattr(db_candidate, key, value)

    db_candidate.last_activity = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(db_candidate)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    # 4. Update Files Table (If a new file was uploaded)
    if final_resume_url:
        existing_file = (
            db.query(models.File)
            .filter(models.File.candidate_id == candidate_id, models.File.file_type == "resume")
            .first()
        )

        if existing_file:
            existing_file.file_url = final_resume_url
            existing_file.file_name = resume.filename
            existing_file.uploaded_at = datetime.utcnow()
        else:
            new_file = models.File(
                file_name=resume.filename,
                file_type="resume",
                file_url=final_resume_url,
                candidate_id=db_candidate.id
            )
            db.add(new_file)
        
        db.commit()

    # Log Activity
    create_candidate_activity_log(
        db=db,
        candidate_id=candidate_id,
        user=current_user,
        action="Updated Candidate",
        details="Candidate details updated"
    )

    return db_candidate

def delete_candidate(db: Session, candidate_id: str, current_user: User):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    db.delete(db_candidate)
    db.commit()

    create_candidate_activity_log(
        db=db,
        candidate_id=candidate_id,
        user=current_user,
        action="Deleted Candidate",
        details=f"Candidate '{db_candidate.name}' deleted.",
    )
    return db_candidate


def create_candidate_activity_log(
    db: Session,
    candidate_id: str,
    user: User,
    action: str,
    details: Optional[str] = None,
):
    log = models.CandidateActivityLog(
        candidate_id=candidate_id,
        user_id=user.id,
        username=user.name,
        action=action,
        details=details,
        timestamp=datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
