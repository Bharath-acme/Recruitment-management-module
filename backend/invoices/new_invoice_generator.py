# new_invoice_generator.py
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle,
    Paragraph, Spacer, Image, Flowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
import io
import os


class TopBorder(Flowable):
    """Draws the exact top border shown in screenshot."""
    def __init__(self, envelope_id, width=letter[0]):
        Flowable.__init__(self)
        self.width = width
        self.height = 18  # strip height
        self.envelope_id = envelope_id

 

class InvoiceGenerator:
    def __init__(self):
        self.story = []
        self.styles = getSampleStyleSheet()
        self._setup_styles()

    # ---------------------------------------------------
    # INTERNAL STYLE SETUP
    # ---------------------------------------------------
    def _setup_styles(self):
        self.styles.add(ParagraphStyle(
            name="CustomTitle",
            fontSize=10,
            alignment=TA_CENTER,
            spaceAfter=10
        ))

        self.styles.add(ParagraphStyle(
            name="Small",
            fontSize=10
        ))
        

        self.styles.add(ParagraphStyle(
            name="Bold",
            fontSize=10,
            fontName="Helvetica-Bold"
        ))

        self.styles.add(ParagraphStyle(
            name="CustomBold",
            fontSize=9,
            alignment=TA_CENTER,
            fontName="Helvetica-Bold"
        ))

        self.styles.add(ParagraphStyle(
        name='CustomSmall',
        parent=self.styles['Small'],
        fontSize=9
        ))

        # self.styles.add(ParagraphStyle(
        #     name='CustomBold',
        #     parent=self.styles['Bold'],
        #     fontSize=9,
        #     fontName="Helvetica-Bold"
        # ))

    def _draw_top_border(self, canvas, doc, envelope_id):
            canvas.saveState()

            W, H = doc.pagesize
            bar_height = 14

            # Grey bar full width
            canvas.setFillColor(colors.HexColor("#c0c0c0"))
            canvas.rect(0, H - bar_height, W, bar_height, stroke=0, fill=1)

            # White trapezoid
            def draw_poly(points, color):
                from reportlab.pdfgen import pathobject
                p = canvas.beginPath()
                x0, y0 = points[0]
                p.moveTo(x0, y0)
                for x, y in points[1:]:
                    p.lineTo(x, y)
                p.close()
                canvas.setFillColor(color)
                canvas.drawPath(p, fill=1, stroke=0)

            draw_poly([
                (W - 70, H - bar_height),
                (W - 100,  H),
                (W - 120,  H),
                (W - 95, H - bar_height)
            ], colors.white)

            draw_poly([
                (W - 75, H - bar_height),
                (W - 100,  H),
                (W - 70,  H),
                (W - 70, H - bar_height)
            ], colors.HexColor("#1A2F6B"))


            # Blue strip at right
            canvas.setFillColor(colors.HexColor("#1A2F6B"))
            canvas.rect(W - 70, H - bar_height, 70, bar_height, stroke=0, fill=1)

            canvas.restoreState()

            # Draw Envelope ID bar BELOW top bar
            canvas.saveState()
            box_y = H - bar_height - 5
            canvas.setFillColor(colors.white)
            canvas.rect(10, box_y, 300, 10, stroke=0, fill=1)

            canvas.setFillColor(colors.black)
            canvas.setFont("Helvetica", 8)
            canvas.drawString(16, box_y + 2,
                f"Docusign Envelope ID: {envelope_id}"
            )

            canvas.restoreState()

    def _draw_bottom_border(self, canvas, doc):
        canvas.saveState()

        W, H = doc.pagesize
        bar_h = 14
        y = 0   # stick to bottom

        # --- 1. WHITE SLASH (LEFT) ---
        p1 = canvas.beginPath()
        p1.moveTo(0, y)                  # bottom-left
        p1.lineTo(100, y)                 # bottom-right
        p1.lineTo(120, y + bar_h)         # top-right
        p1.lineTo(0,  y + bar_h)         # top-left
        p1.close()
        canvas.setFillColor(colors.HexColor("#1A2F6B"))
        canvas.drawPath(p1, fill=1, stroke=0)

        # # --- 2. BLUE BLOCK ---
        # canvas.setFillColor(colors.HexColor("#1A2F6B"))
        # canvas.rect(40, y, 60, bar_h, stroke=0, fill=1)

        # --- 3. WHITE SLASH (RIGHT OF BLUE) ---
        p2 = canvas.beginPath()
        p2.moveTo(100, y)                # bottom-left
        p2.lineTo(135, y)                # bottom-right
        p2.lineTo(115, y + bar_h)        # top-right
        p2.lineTo(85,  y + bar_h)        # top-left
        p2.close()
        canvas.setFillColor(colors.white)
        canvas.drawPath(p2, fill=1, stroke=0)

        # --- 4. LIGHT GREY SLASH ---
        p3 = canvas.beginPath()
        p3.moveTo(115, y)                # bottom-left
        p3.lineTo(390, y)                # bottom-right
        p3.lineTo(370, y + bar_h)        # top-right
        p3.lineTo(100, y + bar_h)        # top-left
        p3.close()
        canvas.setFillColor(colors.HexColor("#d0d0d0"))
        canvas.drawPath(p3, fill=1, stroke=0)

        # --- 5. LONG GREY BAR (aligned perfectly with angled top edge) ---
       # --- 5. LONG GREY BAR (DIAGONAL) ---
        p4 = canvas.beginPath()

        # Left bottom corner matches light-grey slash bottom-right
        p4.moveTo(390, y)      

        # Right bottom corner (full width)
        p4.lineTo(W, y)

        # Right top corner
        p4.lineTo(W, y + bar_h)

        # Left top corner matches light-grey slash top-right (DIAGONAL!)
        p4.lineTo(370, y + bar_h)

        p4.close()

        canvas.setFillColor(colors.HexColor("#c0c0c0"))
        canvas.drawPath(p4, fill=1, stroke=0)


        # --- Footer Text INSIDE the grey bar ---
        footer_text = "www.acmeglobal.tech"
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(colors.HexColor("#1A2F6B"))

        text_width = canvas.stringWidth(footer_text, "Helvetica-Bold", 8)

        canvas.drawString(
            60 + (W - 170 - text_width) / 2,   # centered inside grey bar
            y + (bar_h / 2 - 3),                # vertically centered
            footer_text
        )

        canvas.restoreState()


    # ---------------------------------------------------
    # PUBLIC METHODS EXPECTED BY api.py
    # ---------------------------------------------------

    def add_header(self, envelope_id="", logo_path=None):

        self.envelope_id = envelope_id
        if not logo_path:
            # POINT TO YOUR ASSETS FOLDER
            logo_path = os.path.join(os.path.dirname(__file__), "assets", "logo.png")

        # Envelope ID
        # self.story.append(Paragraph(f"Docusign Envelope ID: {envelope_id}", self.styles["Small"]))
        # self.story.append(Spacer(0.5, 0.15 * inch))

        # Logo or fallback company name
        if os.path.exists(logo_path):
            self.story.append(Image(logo_path, width=2.5 * inch, height=.8 * inch))
        else:
            self.story.append(Paragraph(
                "<b>ACME GLOBAL HUB</b>",
                ParagraphStyle(name="CompanyName", fontSize=18, alignment=TA_CENTER)
            ))

        # self.story.append(Spacer(1, 0.15 * inch))
        # self.story.append(Spacer(1, 0.15 * inch))


    # ---------------------------------------------------

    def add_invoice_details(self, customer, invoice):
        """Builds LEFT table + RIGHT table inside a MASTER table with heading."""

        # -------------------------------------------------------
        # LEFT TABLE (Customer + Ship To)
        # -------------------------------------------------------

        left_data = [
            # [Paragraph("<b>Customer Name & Address:</b>", self.styles["Bold"])],
            [Paragraph(
                f""" <b>Customer Name & Address:</b><br/>
                    {customer.get('name','')}<br/>
                    {customer.get('address','')}<br/>
                   
                """,
                self.styles["Small"]
            )],
            # [Paragraph("<b>Ship To:</b>", self.styles["Bold"])],
            [Paragraph(
                f"""<b>Ship To:</b> <br/>
                    {customer.get('name','')}<br/>
                    {customer.get('address','')}<br/>
                """,
                self.styles["Small"]
            )],
        ]

        left_table = Table(
            left_data,
            colWidths=[3.5 * inch,4.5 * inch],
            rowHeights=[1.43 * inch,1.43 * inch]
        )

        left_table.setStyle(TableStyle([
            ("GRID", (0,0), (-1,-1), 0.4, colors.black),
            ("LEFTPADDING", (0,0), (-1,-1), 4),
            ("RIGHTPADDING", (0,0), (-1,-1), 4),
            ("VALIGN", (0,0), (-1,-1), "TOP"),
        ]))

        # -------------------------------------------------------
        # RIGHT TABLE (7 Invoice Fields)
        # -------------------------------------------------------

        right_rows = [
            ["Invoice Number", invoice.get("invoice_number","")],
            ["PO No.", invoice.get("po_number","")],
            ["Invoice Date", invoice.get("invoice_date","")],
            ["Currency", invoice.get("currency","")],
            ["GSTIN", invoice.get("gstin","")],
            ["Payment Terms", invoice.get("payment_terms","")],
            ["Place of Supply", invoice.get("place_of_supply","")],
        ]

        right_table = Table(
            [
                [
                    Paragraph(f"<b>{label}</b>", self.styles["Bold"]),
                    Paragraph(str(value), self.styles["Small"])
                ]
                for label, value in right_rows
            ],
            colWidths=[1.8 * inch, 1.7 * inch],
            rowHeights=[0.41 * inch] * 7
        )

        right_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.4, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ]))

        # -------------------------------------------------------
        # MASTER TABLE (Heading + two sub tables)
        # -------------------------------------------------------

        heading_paragraph = Paragraph("<b>Tax Invoice</b>", self.styles["CustomTitle"])

        master = Table(
            [
                [heading_paragraph, ""],            # row 0 headline
                [left_table, right_table]           # row 1 body
            ],
            colWidths=[3.5 * inch, 3.5 * inch],
            rowHeights=[0.20 * inch,2.9 * inch]
        )

        master.setStyle(TableStyle([
            ("SPAN", (0,0), (1,0)),               # Heading spans 2 columns
            ("GRID", (0,0), (-1,-1), 0.4, colors.black),
            ("VALIGN", (0,0), (-1,-1), "TOP"),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 6),
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey)
           
        ]))

        self.story.append(master)
        self.story.append(Spacer(1, 0.2 * inch))

    # ---------------------------------------------------

    def add_items_table(self, items):
        """Add items/services table"""
        
        # Table header
        header = [
            Paragraph("<b>Sl. No</b>", self.styles['CustomSmall']),
            Paragraph("<b>Item Code/<br/>Description</b>", self.styles['CustomSmall']),
            Paragraph("<b>UoM</b>", self.styles['CustomSmall']),
            Paragraph("<b>Qty</b>", self.styles['CustomSmall']),
            Paragraph("<b>Unit Price (in USD)</b>", self.styles['CustomSmall']),
            Paragraph("<b>Rate of GST</b>", self.styles['CustomSmall']),
            Paragraph("<b>Taxable Value (in USD)</b>", self.styles['CustomSmall'])
        ]
        
        # Items data
        table_data = [header]
        
        for item in items:
            row = [
                item.get('sl_no', ''),
                Paragraph(item.get('description', ''), self.styles['CustomSmall']),
                item.get('uom', ''),
                item.get('qty', ''),
                f"{item.get('unit_price', 0):.2f}",
                item.get('gst_rate', ''),
                f"{item.get('taxable_value', 0):.2f}"
            ]
            table_data.append(row)
        
        items_table = Table(
            table_data,
            colWidths=[0.5*inch, 2*inch, 0.6*inch, 0.6*inch, 1*inch, 0.8*inch, 1.5*inch]
        )
        
        items_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        self.story.append(items_table)

    def add_totals_section(self, totals_data):
        """Add order subtotal, discount, and other totals"""
        
        totals = [
            [Paragraph("<b>Order Subtotal</b>", self.styles['CustomBold']), '', '', '', '', '', f"USD {totals_data.get('subtotal', 0):.2f}"],
            [Paragraph("<b>Discount</b>", self.styles['CustomBold']), '', '', '', '', '', ''],
            [Paragraph("<b>IGST Amount (Zero rated sales)</b>", self.styles['CustomBold']), '', '', '', '', '', ''],
            [Paragraph(f"""<b>Total in Words:   </b> {totals_data.get('total_in_words')}""", self.styles['CustomBold']), '','','',  f"USD {totals_data.get('total', 0):.2f}"],
            [Paragraph("<b>Exchange Factor</b>", self.styles['CustomBold']), '', '', '', '', '', totals_data.get('exchange_rate', '')],
            [ totals_data.get('total_in_local_currency_words', ''),  totals_data.get('total_in_local_currency')],
        ]
        
        totals_table = Table(
            totals,
            colWidths=[5.5*inch, 0*inch, 0*inch, 0*inch, 0*inch, 0*inch, 1.5*inch]
        )
        
        totals_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (6, 0), (6, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('SPAN', (1, 3), (5, 3)),  # Total in words spans multiple columns
            ('SPAN', (1, 5), (5, 5)),  # Local currency words spans multiple columns
        ]))
        
        self.story.append(totals_table)
        self.story.append(Spacer(1, 0.3*inch))

    # ---------------------------------------------------

    def add_signatures(self):
        data = [
            [Paragraph("<b>Signed by:</b>", self.styles["Small"]),
             Paragraph("<b>Signed by:</b>", self.styles["Small"]),
             Paragraph("<b>Countersigned by:</b>", self.styles["Small"])],
            ["", "", ""],
            ["_________________", "_________________", "_________________"],
        ]

        table = Table(data, colWidths=[2.2 * inch, 2.2 * inch, 2.2 * inch])
        table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))

        self.story.append(table)
        self.story.append(Spacer(1, 0.15 * inch))

    # ---------------------------------------------------

    def add_bank_details(self, bank, outstanding):
        bank_info = f"""
            <b>Bank Account Details:</b><br/>
            <b>Account Name:</b> {bank.get('account_name')}<br/>
            <b>Name & Address:</b> {bank.get('bank_address')}<br/>
            <b>Account No:</b> {bank.get('account_no')}<br/>
            <b>SWIFT:</b> {bank.get('swift_code')}<br/>
            <b>IFSC:</b> {bank.get('ifsc_code')}
        """

        out_info = "<b>Outstanding Dues:</b><br/>"
        for d in outstanding:
            out_info += f"{d['period']}: {d['amount']}<br/>"

        table = Table([
            [Paragraph(bank_info, self.styles["Small"]),
             Paragraph(out_info, self.styles["Small"])]
        ], colWidths=[3.5 * inch, 3 * inch])

        table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.4, colors.black)
        ]))

        self.story.append(table)
        self.story.append(Spacer(1, 0.15 * inch))

    # ---------------------------------------------------

    def add_footer(self, addr, contact):
        text = f"{addr}<br/>{contact}<br/><b>www.acmeglobal.tech</b>"
        self.story.append(Paragraph(text, ParagraphStyle(
            name="Footer",
            fontSize=7,
            alignment=TA_CENTER
        )))

    # ---------------------------------------------------

    def build_pdf(self):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=30, leftMargin=30,
            topMargin=10, bottomMargin=40  # leave room for borders
        )

        def first_page(canvas, doc, self=self):
            self._draw_top_border(canvas, doc, self.envelope_id)
            self._draw_bottom_border(canvas, doc)

        def later_page(canvas, doc, self=self):
            self._draw_top_border(canvas, doc, self.envelope_id)
            self._draw_bottom_border(canvas, doc)

        doc.build(self.story, onFirstPage=first_page, onLaterPages=later_page)
        buffer.seek(0)
        return buffer

