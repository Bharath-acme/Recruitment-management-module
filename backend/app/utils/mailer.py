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

# utils/email.py
# from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# conf = ConnectionConfig(
#     MAIL_USERNAME="your_email@example.com",
#     MAIL_PASSWORD="your_password",
#     MAIL_FROM="your_email@example.com",
#     MAIL_PORT=587,
#     MAIL_SERVER="smtp.gmail.com",
#     MAIL_TLS=True,
#     MAIL_SSL=False,
# )

# async def send_reset_email(to_email: str, link: str):
#     message = MessageSchema(
#         subject="Reset your RMM password",
#         recipients=[to_email],
#         body=f"Click this link to reset your password: {link}",
#         subtype="plain"
#     )
#     fm = FastMail(conf)
#     await fm.send_message(message)

