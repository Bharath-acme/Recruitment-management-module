# models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models import Company

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    # single combined client address block
    client_address = Column(Text, nullable=True)
    client_company = Column(ForeignKey("companies.id"), nullable=True)

    # invoice meta
    envelope_id = Column(String(200), nullable=True)
    invoice_number = Column(String(50), nullable=True, index=True)
    po_number = Column(String(100), nullable=True)
    invoice_date = Column(String(50), nullable=True)
    currency = Column(String(20), nullable=True)
    gstin = Column(String(100), nullable=True)
    payment_terms = Column(String(255), nullable=True)
    place_of_supply = Column(String(255), nullable=True)
    service_description = Column(String(255), nullable=True)

    total_amount = Column(Float, default=0.0)
    pdf_url = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # DO NOT use back_populates → avoids recursion
    items = relationship(
        "InvoiceItem",
        lazy="joined",
        cascade="all, delete-orphan"
    )
    company = relationship("Company", back_populates="invoices")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(255))
    quantity = Column(Integer)
    unit_price = Column(Float)
    uom = Column(String(100))
    taxable_value = Column(Float)
    gst = Column(Integer)

    invoice_id = Column(Integer, ForeignKey("invoices.id"))

    # NO reverse relationship → permanently stops recursion
    invoice = relationship("Invoice", lazy="noload")
