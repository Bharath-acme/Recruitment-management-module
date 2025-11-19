from pydantic import BaseModel
from typing import List,Optional
from datetime import datetime

class InvoiceItemBase(BaseModel):
    description: str
    quantity: int
    unit_price: float
    uom: str
    taxable_value: float
    gst: float


class InvoiceItemCreate(InvoiceItemBase):
    pass


class InvoiceItemOut(InvoiceItemBase):
    id: int

    class Config:
        orm_mode = True


class InvoiceBase(BaseModel):
    to_address: str
    place_of_supply: str
    payment_terms: str
    service_description: str
    item_description: str


class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]


class InvoiceOut(InvoiceBase):
    id: int
    total_amount: float
    pdf_url: Optional[str]
    created_at: datetime
    items: List[InvoiceItemOut]

    class Config:
        orm_mode = True
