# api.py
from fastapi import APIRouter, Depends, HTTPException, Query, Form, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from . import schemas, crud,models
from app.database import get_db

router = APIRouter()

PDF_DIR = "pdfs"
os.makedirs(PDF_DIR, exist_ok=True)


def save_file(file: UploadFile) -> str:
    # Basic save, in production consider unique names, S3 etc.
    file_path = os.path.join(PDF_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    return file_path

@router.post("/create", response_model=schemas.InvoiceOut)
def create_invoice(payload: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    return crud.create_invoice_crud(db, payload)

@router.post("/upload")
def upload_invoice(
    client_company: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # save file → generate pdf_url
    pdf_url = save_file(file)

    invoice = models.Invoice(
        client_company=client_company,
        pdf_url=pdf_url
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.get("/get-invoices", response_model=list[schemas.InvoiceOut])
def list_invoices(db: Session = Depends(get_db)):
    return crud.get_invoices(db)


@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    preview: bool = Query(False),
    db: Session = Depends(get_db)
):
    inv = crud.get_invoice_by_id(db, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if preview:
        pdf_path = os.path.join(PDF_DIR, f"invoice_{invoice_id}.pdf")
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="PDF not found")

        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"invoice_{invoice_id}.pdf",
            headers={"Content-Disposition": "inline"}
        )

    return schemas.InvoiceOut.model_validate(inv, from_attributes=True)
