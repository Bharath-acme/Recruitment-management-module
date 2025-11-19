from sqlalchemy.orm import Session
from . import models, schemas
from .pdfgenerator import generate_invoice_pdf
import os

PDF_DIR = "pdfs"
os.makedirs(PDF_DIR, exist_ok=True)

def create_invoice_crud(db: Session, data: schemas.InvoiceCreate) -> models.Invoice:
    # 1. Calculate total amount (using quantity * unit_price — change if you want taxable_value)
    total_amount = sum(item.quantity * item.unit_price for item in data.items)

    # 2. Create Invoice record
    invoice = models.Invoice(
        to_address=data.to_address,
        place_of_supply=data.place_of_supply,
        payment_terms=data.payment_terms,
        service_description=data.service_description,
        item_description=data.item_description,
        total_amount=total_amount,
        pdf_url="",  # updated later
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)  # now invoice.id is available

    # 3. Add items
    for item in data.items:
        db_item = models.InvoiceItem(
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            uom=item.uom,
            taxable_value=item.taxable_value,
            gst=item.gst,
            invoice_id=invoice.id
        )
        db.add(db_item)

    db.commit()
    db.refresh(invoice)  # refresh to load relationship when needed

    # 4. Generate PDF
    pdf_result = generate_invoice_pdf(data, invoice.id)

    # accept either bytes or io.BytesIO from generator
    if hasattr(pdf_result, "getvalue"):
        pdf_bytes = pdf_result.getvalue()
    elif isinstance(pdf_result, (bytes, bytearray)):
        pdf_bytes = bytes(pdf_result)
    else:
        raise RuntimeError("generate_invoice_pdf must return bytes or BytesIO")

    pdf_path = os.path.join(PDF_DIR, f"invoice_{invoice.id}.pdf")
    # write bytes
    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes)

    invoice.pdf_url = f"/pdfs/invoice_{invoice.id}.pdf"

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return invoice

def get_invoices(db: Session):
    return db.query(models.Invoice).all()


def get_invoice_by_id(db: Session, invoice_id: int):
    return db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
