# crud.py
import io
import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from . import models, schemas
from .new_invoice_generator import InvoiceGenerator

PDF_DIR = "pdfs"
os.makedirs(PDF_DIR, exist_ok=True)


# ----------------- invoice number generator -----------------
def _current_financial_year_span(now=None):
    now = now or datetime.utcnow()
    year = now.year
    if now.month >= 4:
        start = datetime(year, 4, 1)
        end = datetime(year + 1, 3, 31, 23, 59, 59, 999999)
    else:
        start = datetime(year - 1, 4, 1)
        end = datetime(year, 3, 31, 23, 59, 59, 999999)
    return start.year, end.year, start, end


def _generate_invoice_number(db: Session):
    fy_start, fy_end, start_dt, end_dt = _current_financial_year_span()
    count = db.query(func.count(models.Invoice.id)).filter(
        and_(models.Invoice.created_at >= start_dt,
             models.Invoice.created_at <= end_dt)
    ).scalar() or 0

    seq = str(count + 1).zfill(3)
    return f"{str(fy_start % 100).zfill(2)}{str(fy_end % 100).zfill(2)}{seq}"


# ----------------- create invoice -----------------
def create_invoice_crud(db: Session, data: schemas.InvoiceCreate):

    envelope_id = str(uuid.uuid4()).upper()
    invoice_number = _generate_invoice_number(db)

    invoice = models.Invoice(
        client_address=data.client_address,
        envelope_id=envelope_id,
        invoice_number=invoice_number,
        po_number=data.po_num,
        invoice_date=datetime.utcnow().strftime("%d-%m-%Y"),
        currency=data.currency,
        gstin="NA",
        payment_terms=data.payment_terms,
        place_of_supply=data.place_of_supply,
        service_description=data.service_description,
        total_amount=data.total_amount
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    # Add items
    for item in data.items:
        db.add(models.InvoiceItem(
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            uom=item.uom,
            taxable_value=item.taxable_value,
            gst=item.gst,
            invoice_id=invoice.id
        ))

    db.commit()
    db.refresh(invoice)

    # ----- PDF Payload -----
    payload = {
        "envelope_id": envelope_id,
        "customer": {"name": "", "address": data.client_address},
        "invoice": {
            "invoice_number": invoice_number,
            "po_number": data.po_num,
            "invoice_date": invoice.invoice_date,
            "currency": data.currency,
            "gstin": "NA",
            "payment_terms": data.payment_terms,
            "place_of_supply": data.place_of_supply,
            "description": data.service_description
        },
        "items": [
            {
                "sl_no": idx + 1,
                "description": it.description,
                "uom": it.uom,
                "qty": it.quantity,
                "unit_price": it.unit_price,
                "gst_rate": it.gst,
                "taxable_value": it.taxable_value
            }
            for idx, it in enumerate(data.items)
        ],
        "totals": {
            "subtotal": data.total_amount,
            "total": data.total_amount,
            "total_in_words": "",
            "exchange_rate": "",
            "total_in_local_currency": "",
            "total_in_local_currency_words": ""
        },
        "bank_details": {
            "account_name": "ACME Global Hub Pvt Ltd",
            "bank_address": "HSBC Bank, Hyderabad",
            "account_no": "082-752700-511",
            "swift_code": "HSBCINBB",
            "ifsc_code": "HSBC0500002"
        },
        "outstanding_dues": [],
        "footer": {
            "address": "504 & 506, 4th Floor, KFC Illumination, HITEC City, Hyderabad",
            "contact": "CIN: U72900TG2022FTC167791 | accounts@acmeglobal.tech | 900376109"
        }
    }

    # Generate PDF
    generator = InvoiceGenerator()
    generator.add_header(envelope_id)
    generator.add_invoice_details(payload["customer"], payload["invoice"])
    generator.add_items_table(payload["items"])
    generator.add_totals_section(payload["totals"])
    generator.add_signatures()
    generator.add_bank_details(payload["bank_details"], payload["outstanding_dues"])
    generator.add_footer(payload["footer"]["address"], payload["footer"]["contact"])

    pdf_bytes = generator.build_pdf()
    pdf_path = os.path.join(PDF_DIR, f"invoice_{invoice.id}.pdf")

    with open(pdf_path, "wb") as f:
        f.write(pdf_bytes.getvalue())

    invoice.pdf_url = f"/pdfs/invoice_{invoice.id}.pdf"
    db.add(invoice)
    db.commit()

    return invoice


def get_invoices(db: Session):
    return db.query(models.Invoice).order_by(models.Invoice.created_at.desc()).all()


def get_invoice_by_id(db: Session, invoice_id: int):
    return db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
