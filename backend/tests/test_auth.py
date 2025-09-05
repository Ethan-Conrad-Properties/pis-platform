import pytest
from fastapi import Request
from app.auth import verify_token
from fastapi import HTTPException

def test_verify_token_without_header():
    request = Request({"type": "http", "headers": []})
    with pytest.raises(HTTPException) as excinfo:
        verify_token(request)
    assert excinfo.value.status_code == 401
