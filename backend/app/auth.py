from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, jwk
import requests
import os

# -------------------------------------------------------------------
# Authentication (Azure AD)
# Uses OAuth2 Bearer tokens issued by Azure Active Directory.
# This module fetches Azure AD public keys and validates JWT tokens.
# -------------------------------------------------------------------

# FastAPI dependency that extracts the bearer token from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Azure AD settings pulled from environment variables
AZURE_AD_TENANT_ID = os.getenv("AZURE_AD_TENANT_ID")
AZURE_AD_CLIENT_ID = os.getenv("AZURE_AD_CLIENT_ID")


def get_azure_public_keys():
    """
    Retrieve Azure AD public signing keys (JWKS).

    These keys are used to validate JWT signatures issued by Azure AD.

    Returns:
        list[dict]: A list of JWK (JSON Web Key) dictionaries.
    """
    jwks_url = f"https://login.microsoftonline.com/{AZURE_AD_TENANT_ID}/discovery/v2.0/keys"
    return requests.get(jwks_url).json()["keys"]


def verify_token(token: str = Depends(oauth2_scheme)):
    """
    Validate an Azure AD JWT token.

    Steps:
    - Extract unverified header to identify which key was used.
    - Match against Azure AD's published keys.
    - Decode and validate the token's signature, audience, and issuer.

    Args:
        token (str): JWT bearer token extracted from the request.

    Returns:
        dict: Decoded JWT payload (user claims).

    Raises:
        HTTPException: If validation fails (401 Unauthorized).
    """
    try:
        keys = get_azure_public_keys()

        # Extract header without verifying signature
        unverified_header = jwt.get_unverified_header(token)

        # Find matching public key by 'kid'
        key = next(k for k in keys if k["kid"] == unverified_header["kid"])
        public_key = jwk.construct(key, algorithm="RS256")

        # Decode and validate the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=f"api://{AZURE_AD_CLIENT_ID}",
            issuer=f"https://sts.windows.net/{AZURE_AD_TENANT_ID}/"
        )

        return payload

    except Exception as e:
        # Log error for debugging
        print("Token validation error:", e)
        raise HTTPException(status_code=401, detail="Invalid token")
