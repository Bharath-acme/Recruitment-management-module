from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import schemas
from . import crud
from app.database import get_db,SessionLocal

router = APIRouter()


@router.post("/create", response_model=schemas.InvoiceOut)
def create_invoice_route(data: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    try:
        invoice = crud.create_invoice_crud(db, data)
    except Exception as e:
        # Surface server error (change to logging in prod)
        raise HTTPException(status_code=500, detail=str(e))
    return invoice


@router.get("", response_model=list[schemas.InvoiceOut])
def list_invoices(db: Session = Depends(get_db)):
    return crud.get_invoices(db)


@router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = crud.get_invoice_by_id(db, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv
