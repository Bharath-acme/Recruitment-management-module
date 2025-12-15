import requests
import os
from app.utils.graph_auth import get_graph_token

MAIL_SENDER = os.getenv("MAIL_SENDER", "b.kumar@aiatacme.com")
GRAPH_URL = "https://graph.microsoft.com/v1.0/users/{sender}/sendMail"

def send_email_requisition_created(to_emails, subject, body):
    """
    to_emails: list[str]
    """
    token = get_graph_token()

    payload = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "Text",
                "content": body
            },
            "toRecipients": [
                {"emailAddress": {"address": email}}
                for email in to_emails
            ],
            "from": {
                "emailAddress": {"address": MAIL_SENDER}
            }
        },
        "saveToSentItems": True
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    res = requests.post(
        GRAPH_URL.format(sender=MAIL_SENDER),
        headers=headers,
        json=payload,
        timeout=10
    )

    if res.status_code not in (200, 202):
        raise Exception(res.text)

    return True
