# file: pdfgenerator.py
import io
import os
from datetime import datetime
from decimal import Decimal

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Table,
    TableStyle,
    Spacer,
    Image,
    Flowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from num2words import num2words

# Path to logo file (change if needed)
LOGO_PATH = "assets/logo.png"

# Optional: register a TTF if you want a nicer font. If not present, ReportLab uses Helvetica family.
# Example:
# pdfmetrics.registerFont(TTFont('Inter-Regular', '/path/to/Inter-Regular.ttf'))

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 18 * mm


class HRLine(Flowable):
    """Simple horizontal line we can insert into flowables."""
    def __init__(self, width=1, color=colors.grey):
        Flowable.__init__(self)
        self.width = width
        self.color = color
        self.height = 6

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.width)
        self.canv.line(0, self.height / 2.0, PAGE_WIDTH - 2 * MARGIN, self.height / 2.0)


def currency_format(v, currency_symbol="₹"):
    try:
        val = Decimal(v)
        return f"{currency_symbol} {val:,.2f}"
    except Exception:
        return str(v)


def safe_get(obj, attr, default="—"):
    return getattr(obj, attr) if getattr(obj, attr, None) not in (None, "") else default


def generate_invoice_pdf(data, invoice_id):
    """
    Generate a corporate ACME-style invoice PDF in memory and return io.BytesIO object.

    data: object (Pydantic model or similar) with attributes:
        - to_address (str, multiline OK)
        - place_of_supply (str)
        - payment_terms (str)
        - service_description (str)
        - item_description (str)
        - items: iterable of {description, quantity, unit_price, uom, taxable_value, gst}
        - po_no (optional)
        - currency (optional, e.g., 'USD' or 'INR')
        - exchange_factor (optional numeric)
        - created_at (optional datetime) - if not provided, current datetime is used.
    invoice_id: int
    """
    buffer = io.BytesIO()

    # Build document with margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
    )

    # Styles
    normal = ParagraphStyle("normal", fontName="Helvetica", fontSize=9, leading=12)
    bold = ParagraphStyle("bold", fontName="Helvetica-Bold", fontSize=10, leading=12)
    title = ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=18, leading=20)
    small_bold = ParagraphStyle("small_bold", fontName="Helvetica-Bold", fontSize=8.5, leading=10)
    small = ParagraphStyle("small", fontName="Helvetica", fontSize=8.5, leading=10)

    # Flowables container
    elements = []

    # Header: logo (left) + company block (right)
    header_table_data = []
    logo_flowable = None
    if os.path.exists(LOGO_PATH):
        # Keep logo size reasonable
        try:
            logo_flowable = Image(LOGO_PATH, width=110, height=40)
        except Exception:
            logo_flowable = None

    company_block = [
        Paragraph("<b>ACME Global Hub Pvt Ltd</b>", title),
        Spacer(1, 2),
        Paragraph("504 & 506, 4th Floor, KTC Illumination, HITEC City, Madhapur, Hyderabad - 500081.", normal),
        Paragraph("CIN: U72900TG2022FTC166791 | Mail Id: accounts@acmeglobal.tech | Mobile: 90003 76109", normal),
    ]

    # Build header layout
    if logo_flowable:
        header_table_data.append([logo_flowable, company_block])
        header_col_widths = [120, PAGE_WIDTH - 2 * MARGIN - 120]
    else:
        header_table_data.append([company_block])
        header_col_widths = [PAGE_WIDTH - 2 * MARGIN]

    header_table = Table(header_table_data, colWidths=header_col_widths)
    header_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    elements.append(header_table)
    elements.append(Spacer(1, 6))

    # Title row: INVOICE and meta (invoice no)
    left = Paragraph("<b>Tax Invoice</b>", title)
    invoice_no = Paragraph(f"<b>Invoice Number:</b> {invoice_id}", bold)
    top_table = Table([[left, invoice_no]], colWidths=[PAGE_WIDTH - 2 * MARGIN - 150, 150])
    top_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elements.append(top_table)
    elements.append(Spacer(1, 8))

    # Build a two-column area: left = Customer block, right = meta box (Invoice Date, PO No, Currency, Place of Supply, Payment Terms)
    created_at = safe_get(data, "created_at", datetime.utcnow())
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except Exception:
            created_at = datetime.utcnow()

    # Customer box (left)
    to_address_text = safe_get(data, "to_address", "")
    customer_lines = [Paragraph("<b>Customer Name & Address:</b>", small_bold)]
    for line in to_address_text.split("\n"):
        customer_lines.append(Paragraph(line.strip(), small))
    customer_block = Table([[customer_lines]])
    customer_block.setStyle(TableStyle([("BOX", (0, 0), (0, 0), 0.5, colors.black), ("LEFTPADDING", (0,0),(-1,-1),6), ("RIGHTPADDING", (0,0),(-1,-1),6), ("TOPPADDING",(0,0),(-1,-1),6), ("BOTTOMPADDING",(0,0),(-1,-1),6)]))

    # Meta box (right)
    po_no = safe_get(data, "po_no", getattr(data, "po_number", "—"))
    currency = safe_get(data, "currency", "INR")
    ship_to = safe_get(data, "ship_to", to_address_text)  # fallback to same address
    meta_rows = [
        [Paragraph("<b>Invoice Date</b>", small_bold), Paragraph(created_at.strftime("%d-%m-%Y"), small)],
        [Paragraph("<b>PO No.</b>", small_bold), Paragraph(po_no, small)],
        [Paragraph("<b>Currency</b>", small_bold), Paragraph(currency, small)],
        [Paragraph("<b>Place of Supply</b>", small_bold), Paragraph(safe_get(data, "place_of_supply", "—"), small)],
        [Paragraph("<b>Payment Terms</b>", small_bold), Paragraph(safe_get(data, "payment_terms", "—"), small)],
    ]
    meta_table = Table(meta_rows, colWidths=[70, 70])
    meta_table.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0),(-1,-1),4), ("RIGHTPADDING", (0,0),(-1,-1),4)]))
    meta_box = Table([[meta_table, Paragraph("<b>Ship To:</b><br/>" + ship_to.replace("\n", "<br/>"), small)]], colWidths=[140, PAGE_WIDTH - 2 * MARGIN - 140 - 10])
    meta_box.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.5, colors.black), ("LEFTPADDING", (0,0),(-1,-1),6), ("RIGHTPADDING", (0,0),(-1,-1),6), ("TOPPADDING",(0,0),(-1,-1),6), ("BOTTOMPADDING",(0,0),(-1,-1),6)]))

    two_col = Table([[customer_block, meta_box]], colWidths=[PAGE_WIDTH * 0.45 - 2 * MARGIN, PAGE_WIDTH * 0.55 - 2 * MARGIN])
    two_col.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    elements.append(two_col)
    elements.append(Spacer(1, 10))

    # Service description
    if safe_get(data, "service_description", ""):
        elements.append(Paragraph("<b>Description of Services:</b>", small_bold))
        elements.append(Paragraph(safe_get(data, "service_description", ""), small))
        elements.append(Spacer(1, 6))

    # Items table header + rows
    items = getattr(data, "items", []) or []
    table_data = [
        [
            Paragraph("<b>SI. No</b>", small_bold),
            Paragraph("<b>Item Code/Description</b>", small_bold),
            Paragraph("<b>UoM</b>", small_bold),
            Paragraph("<b>Qty</b>", small_bold),
            Paragraph("<b>Unit Price</b>", small_bold),
            Paragraph("<b>Rate of GST</b>", small_bold),
            Paragraph("<b>Taxable Value</b>", small_bold),
        ]
    ]

    subtotal = Decimal(0)
    for idx, it in enumerate(items, start=1):
        desc = safe_get(it, "description", "")
        qty = safe_get(it, "quantity", 0)
        uom = safe_get(it, "uom", "")
        unit_price = Decimal(safe_get(it, "unit_price", 0) or 0)
        gst = safe_get(it, "gst", 0)
        taxable = Decimal(safe_get(it, "taxable_value", unit_price * (qty or 0)) or 0)
        subtotal += taxable

        table_data.append([
            Paragraph(str(idx), small),
            Paragraph(desc, small),
            Paragraph(str(uom), small),
            Paragraph(str(qty), small),
            Paragraph(f"{unit_price:,.2f}", small),
            Paragraph(f"{gst}%", small),
            Paragraph(f"{taxable:,.2f}", small),
        ])

    # Add subtotal row
    table_data.append(
        [
            "", "", "", "", "", Paragraph("<b>Order Subtotal</b>", small_bold), Paragraph(f"<b>{subtotal:,.2f}</b>", small_bold)
        ]
    )

    # Build table
    col_widths = [30, 200, 40, 40, 70, 60, 80]
    items_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    items_table_style = TableStyle(
        [
            ("GRID", (0, 0), (-1, -2), 0.4, colors.black),
            ("LINEABOVE", (-2, -1), (-1, -1), 0.8, colors.black),
            ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (3, 1), (4, -1), "CENTER"),
            ("ALIGN", (6, 1), (6, -1), "RIGHT"),
            ("LEFTPADDING", (1, 1), (1, -1), 6),
            ("RIGHTPADDING", (1, 1), (1, -1), 6),
        ]
    )
    items_table.setStyle(items_table_style)

    elements.append(items_table)
    elements.append(Spacer(1, 12))

    # Totals + totals in words + Exchange Factor if provided
    # Currency symbol selection (simple heuristic)
    currency_symbol = "₹" if (currency and currency.upper() in ("INR", "RS", "RUPEE")) else "$" if currency.upper() == "USD" else ""

    # Total in words (Indian English for INR)
    try:
        words = num2words(subtotal, lang="en_IN") if currency.upper() == "INR" else num2words(subtotal, lang="en")
        words = words.replace(" ,", ",").title()
    except Exception:
        words = num2words(float(subtotal)).title()

    totals_table = Table(
        [
            [Paragraph("<b>Total in Words</b>", small_bold), Paragraph(f"{currency} {words} Only", small)],
            [Paragraph("<b>Order Subtotal</b>", small_bold), Paragraph(f"{currency_symbol} {subtotal:,.2f}", small)],
        ],
        colWidths=[PAGE_WIDTH * 0.6, PAGE_WIDTH * 0.35 - 2 * MARGIN],
    )
    totals_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0,0),(-1,-1),6)]))
    elements.append(totals_table)
    elements.append(Spacer(1, 8))

    # Exchange Factor block if provided
    exchange_factor = safe_get(data, "exchange_factor", None)
    if exchange_factor:
        try:
            ef = Decimal(exchange_factor)
            INR_total = ef * subtotal
            elements.append(Paragraph(f"<b>Exchange Factor:</b> {ef}    <b>INR Equivalent:</b> ₹ {INR_total:,.2f}", small))
            elements.append(Spacer(1, 8))
        except Exception:
            pass

    # Outstanding Dues block (optional)
    outstanding = safe_get(data, "outstanding_dues", None)
    if outstanding:
        od_rows = [[Paragraph("<b>Outstanding Dues</b>", small_bold), ""]]
        for k, v in outstanding.items():
            od_rows.append([Paragraph(k, small), Paragraph(str(v), small)])
        od_table = Table(od_rows, colWidths=[PAGE_WIDTH * 0.5, PAGE_WIDTH * 0.35])
        od_table.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.4, colors.black), ("LEFTPADDING", (0,0),(-1,-1),6)]))
        elements.append(od_table)
        elements.append(Spacer(1, 8))

    # Bank details footer block
    bank_block = [
        Paragraph("<b>Bank Account Details:</b>", small_bold),
        Paragraph("Account Name: ACME Global Hub Pvt Ltd", small),
        Paragraph("Bank: HSBC Bank, Hyderabad", small),
        Paragraph("Account No: 082-752700-511 | SWIFT: HSBCINBB | IFSC: HSBC0500002", small),
        Spacer(1, 6),
        Paragraph("This is a computer-generated invoice and does not require a signature.", small),
    ]
    bank_table = Table([[bank_block]], colWidths=[PAGE_WIDTH - 2 * MARGIN])
    bank_table.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.4, colors.black), ("LEFTPADDING", (0,0),(-1,-1),6), ("RIGHTPADDING",(0,0),(-1,-1),6), ("TOPPADDING",(0,0),(-1,-1),6), ("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    elements.append(bank_table)

    # Build document
    doc.build(elements)

    buffer.seek(0)
    return buffer
