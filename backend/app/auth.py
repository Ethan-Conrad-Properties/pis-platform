from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import requests
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

AZURE_AD_TENANT_ID = os.getenv("AZURE_AD_TENANT_ID")
AZURE_AD_CLIENT_ID = os.getenv("AZURE_AD_CLIENT_ID")

def get_azure_public_keys():
    jwks_url = f"https://login.microsoftonline.com/{AZURE_AD_TENANT_ID}/discovery/v2.0/keys"
    return requests.get(jwks_url).json()["keys"]

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        keys = get_azure_public_keys()
        unverified_header = jwt.get_unverified_header(token)
        key = next(k for k in keys if k["kid"] == unverified_header["kid"])
        public_key = jwt.construct_rsa_public_key(key)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=f"api://{AZURE_AD_CLIENT_ID}",
            issuer=f"https://sts.windows.net/{AZURE_AD_TENANT_ID}/"
        )
        # Optionally check email domain
        if not payload.get("preferred_username", "").endswith("@ethanconradprop.com"):
            raise HTTPException(status_code=403, detail="Forbidden")
        return payload
    except Exception as e:
        print("Token validation error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")