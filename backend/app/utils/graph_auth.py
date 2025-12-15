from msal import ConfidentialClientApplication
import os

# TENANT_ID = os.getenv("TENANT_ID")
# CLIENT_ID = os.getenv("CLIENT_ID")
# CLIENT_SECRET = os.getenv("CLIENT_SECRET")

CLIENT_ID = "567c89de-dbb4-4bce-bcea-c0b02b632992"
CLIENT_SECRET = "L518Q~wVnCu4KRgHBzRsMyAc2Vc6165pFwmXSdc0"
TENANT_ID ="a7bd32f9-e443-410f-9dcb-ef170524d4a6"


AUTHORITY = f"https://login.microsoftonline.com/a7bd32f9-e443-410f-9dcb-ef170524d4a6"
SCOPE = ["https://graph.microsoft.com/.default"]

def get_graph_token():
    app = ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=AUTHORITY,
    )
    result = app.acquire_token_for_client(scopes=SCOPE)
    if "access_token" not in result:
        raise Exception(result)
    return result["access_token"]
