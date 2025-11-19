from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    to_address = Column(String(255))
    place_of_supply = Column(String(255))
    payment_terms = Column(String(255))
    service_description = Column(String(255))
    item_description = Column(String(255))
    total_amount = Column(Float)
    pdf_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255))
    quantity = Column(Integer)
    unit_price = Column(Float)
    uom = Column(String(100))
    taxable_value = Column(Float)
    gst = Column(Float)

    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    invoice = relationship("Invoice", back_populates="items")