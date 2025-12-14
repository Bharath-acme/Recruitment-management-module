# schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class InvoiceItemCreate(BaseModel):
    description: str
    quantity: int
    unit_price: float
    uom: str
    taxable_value: float
    gst: Optional[int] = 0


class InvoiceItemOut(BaseModel):
    id: int
    description: str
    quantity: int
    unit_price: float
    uom: str
    taxable_value: float
    gst: Optional[int]

    class Config:
        orm_mode = True
        extra = "ignore"      # <-- prevents recursion from ORM unwanted fields


class InvoiceCreate(BaseModel):
    client_address: str
    place_of_supply: str
    payment_terms: str
    service_description: str
    po_num: Optional[str] = ""
    currency: str
    total_amount: float
    items: List[InvoiceItemCreate]


class InvoiceOut(BaseModel):
    id: int
    client_address: Optional[str]
    envelope_id: Optional[str]
    invoice_number: Optional[str]
    po_number: Optional[str]
    invoice_date: Optional[str]
    currency: Optional[str]
    gstin: Optional[str]
    payment_terms: Optional[str]
    place_of_supply: Optional[str]
    service_description: Optional[str]
    total_amount: Optional[float]
    pdf_url: Optional[str]
    created_at: datetime
    items: List[InvoiceItemOut]

    class Config:
        orm_mode = True
        extra = "ignore"      # <-- critical fix
