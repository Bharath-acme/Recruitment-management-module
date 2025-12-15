import requests
import os
from app.utils.graph_auth import get_graph_token

MAIL_SENDER = "b.kumar@aiatacme.com"
GRAPH_URL = "https://graph.microsoft.com/v1.0/users/{sender}/sendMail"

def send_email_requisition_created(to_emails, subject, body):
    if isinstance(to_emails, str):
        to_emails = [to_emails]

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
            ]
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

    print("Graph status:", res.status_code)
    print("Graph response:", res.text)

    if res.status_code not in (200, 202):
        raise Exception(res.text)

    return True
