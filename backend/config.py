import os

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID =os.getenv("TENANT_ID")



GRAPH_SCOPE = ["https://graph.microsoft.com/.default"]
AUTH_URL = f"https://login.microsoftonline.com/{TENANT_ID}"
GRAPH_API = "https://graph.microsoft.com/v1.0"


