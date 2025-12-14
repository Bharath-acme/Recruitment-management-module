from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List,Optional
from . import schemas, crud,models
from app.database import get_db
from app.auth import get_current_user
from app.models import User
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
from requisitions.schemas import RequisitionMini
from requisitions.crud import get_requisitions  
>>>>>>> e561f9799a65bfecdaaa04822805a896b14baa17
=======
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a

router = APIRouter()


<<<<<<< HEAD

router = APIRouter()

=======
from fastapi import UploadFile, File
import tempfile
from app.utils.parse_resume import parse_resume


router = APIRouter()

>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
@router.post("/parse-resume")
def parse_resume_endpoint(file: UploadFile = File(...)):
    # Save temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name

    # Parse the resume
    result = parse_resume(tmp_path)
    return result

<<<<<<< HEAD
>>>>>>> Stashed changes
=======

>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
@router.post("", response_model=CandidateResponse)
def create_candidate(
    candidate: CandidateCreate,
=======
@router.get("", response_model=List[schemas.CandidateResponse])
def read_candidates(
    skip: int = 0,
    limit: int = 100,
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a
    db: Session = Depends(get_db),
    user:User = Depends(get_current_user)
):
    query = db.query(models.Candidate)

    # 🏢 Company-based filtering
    if user.company_rel.name.lower() != "acme global hub":
        query = query.filter(
            models.Candidate.company_id == user.company_rel.id,
            models.Candidate.status == "approved"
        )

    # 🟢 If the user's role is recruiter, fetch only their candidates
    if user.role.lower() == "recruiter":
        query = query.filter(models.Candidate.recruiter == user.name)

    candidates = query.offset(skip).limit(limit).all()

    # 🔒 If user is not from Acme Global, hide sensitive fields
    if user.company_rel.name.lower() != "acme global hub":
        for c in candidates:
            c.email = None
            c.phone = None
            c.resume_url = None
            c.source = None
           

    return candidates



@router.get("/{candidate_id}", response_model=schemas.CandidateResponse)
def read_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    db_candidate = crud.get_candidate(db, candidate_id)
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # 🏢 NEW: Company-based authorization
    if user.company_rel.name.lower() != "acme global hub":
        if db_candidate.company_id != user.company_rel.id:
            raise HTTPException(status_code=403, detail="Access denied: Candidate does not belong to your company.")

    # 🟢 Recruiter can only view their own candidates
    if user.role.lower() == "recruiter" and db_candidate.recruiter != user.name:
        raise HTTPException(status_code=403, detail="Access denied for this candidate")

    # 🔒 Hide sensitive info if user is not from Acme Global
    if user.company_rel.name.lower() != "acme global hub":
        db_candidate.email = None
        db_candidate.phone = None
        db_candidate.resume_url = None
        db_candidate.source = None
        db_candidate.files = []
      

    return db_candidate


@router.post("", response_model=schemas.CandidateResponse)
def create_candidate(
      # FILE INPUT
    resume: UploadFile = File(None),
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    location: str = Form(None),
    position: str = Form(None),
    requisition_id: int = Form(...),
    experience: int = Form(None),
    skills: List[str] = Form([]),
    source: str = Form(None),
    current_ctc: str = Form(None),
    expected_ctc: str = Form(None),
    notice_period: str = Form(None),
    current_company: str = Form(None),
    dob: str = Form(None),
    marital_status: str = Form(None),
    recruiter: str = Form(None),
    # nationality: str = Form(None),
    status: str = Form("new"),
    company_id: Optional[int] = None,

  

    # FOR EDIT MODE (KEEP OLD FILE)
    resume_path: str = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "position": position,
        "requisition_id": requisition_id,
        "experience": experience,
        "skills": skills,
        "source": source,
        "current_ctc": current_ctc,
        "expected_ctc": expected_ctc,
        "notice_period": notice_period,
        "current_company": current_company,
        "dob": dob,
        "marital_status": marital_status,
        "recruiter": recruiter,
        # "nationality": nationality,
        "status": status,
        "company_id": company_id,
    }
    print("resume_path",resume_path)
    
    return crud.create_candidate_service(
        db=db,
        data=data,
        resume=resume,
        resume_path=resume_path,
        current_user=current_user
    )



# @router.post("", response_model=schemas.CandidateResponse)
# def create_candidate(
#     candidate: schemas.CandidateCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
    
#     return crud.create_candidate(db=db, candidate=candidate, current_user=current_user)


# @router.put("/{candidate_id}", response_model=schemas.CandidateResponse)
# def update_candidate(
#     candidate_id: str,
#     candidate: schemas.CandidateUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     # ✅ Resume parsing skipped intentionally
#     updated_candidate = crud.update_candidate(db, candidate_id, candidate, current_user)
#     return updated_candidate


# In your router file

@router.put("/{candidate_id}", response_model=schemas.CandidateResponse)
async def update_candidate(
    candidate_id: str,
    # 1. We must explicitly list Form fields here because we are accepting a File
    resume: UploadFile = File(None),
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    requisition_id: Optional[int] = Form(None),
    experience: Optional[int] = Form(None),
    skills: List[str] = Form([]), # Receives list from FormData
    source: Optional[str] = Form(None),
    current_ctc: Optional[str] = Form(None),
    expected_ctc: Optional[str] = Form(None),
    notice_period: Optional[str] = Form(None),
    current_company: Optional[str] = Form(None),
    dob: Optional[str] = Form(None),
    marital_status: Optional[str] = Form(None),
    recruiter: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    
    # This handles the case where we keep the old resume URL
    resume_path: Optional[str] = Form(None),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 2. Bundle the Form data into a dictionary
    update_data = {
        "name": name,
        "email": email,
        "phone": phone,
        "location": location,
        "position": position,
        "requisition_id": requisition_id,
        "experience": experience,
        "skills": skills,
        "source": source,
        "current_ctc": current_ctc,
        "expected_ctc": expected_ctc,
        "notice_period": notice_period,
        "current_company": current_company,
        "dob": dob,
        "marital_status": marital_status,
        "recruiter": recruiter,
        "status": status,
        "resume_path": resume_path
    }
    
    # Filter out None values so we don't overwrite existing data with Nulls
    # (Optional: depends if you want to allow clearing fields)
    update_data = {k: v for k, v in update_data.items() if v is not None}

    updated_candidate = crud.update_candidate_service(
        db=db, 
        candidate_id=candidate_id, 
        data=update_data, 
        resume=resume, 
        current_user=current_user
    )
    return updated_candidate

@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    crud.delete_candidate(db, candidate_id, current_user)
    return {"message": f"Candidate {candidate_id} deleted successfully"}


def get_candidate_logs(db: Session, candidate_id: int):
    return (
        db.query(models.CandidateActivityLog)
        .filter(models.CandidateActivityLog.candidate_id == candidate_id)
        .order_by(models.CandidateActivityLog.created_at.desc())
        .all()
    )

@router.get("/{candidate_id}/activity-logs", response_model=List[schemas.CandidateActivityLogOut])
def get_candidate_activity_logs(candidate_id: str, db: Session = Depends(get_db)):
    """Retrieve activity logs for a specific candidate."""
    logs = db.query(models.CandidateActivityLog)\
        .filter(models.CandidateActivityLog.candidate_id == candidate_id)\
        .order_by(models.CandidateActivityLog.timestamp.desc())\
        .all()
    return logs