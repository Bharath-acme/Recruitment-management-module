import os
import aiosmtplib
from email.message import EmailMessage
import asyncio

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", "no-reply@yourapp.com")

def send_email(to_emails, subject, body):
    if not to_emails:
        return
    msg = EmailMessage()
    msg["From"] = FROM_EMAIL
    msg["To"] = ", ".join(to_emails)
    msg["Subject"] = subject
    msg.set_content(body)

    async def _send():
        await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASSWORD,
            start_tls=True,
        )

    asyncio.run(_send())
