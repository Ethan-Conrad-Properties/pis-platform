from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Code
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Codes
# Each "Code" belongs to a property (via property_yardi).
# Logs are written on create, update, and delete for audit history.
# -------------------------------------------------------------------

@router.get("/codes")
async def get_codes(
    property_yardi: str,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get all codes for a given property.

    Args:
        property_yardi (str): Unique identifier for the property.
        db (Session): Database session (injected by FastAPI).
        user (dict): Authenticated user (from token).

    Returns:
        list[dict]: All codes linked to the property.
    """
    codes = (
        db.query(Code)
        .filter(Code.property_yardi == property_yardi)
        .order_by(Code.code.asc())
        .all()
    )
    return [c.__dict__ for c in codes]


@router.post("/codes")
async def create_code(
    code: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Create a new code for a property.

    Args:
        code (dict): Request body containing code fields.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Newly created code (cleaned of SQLAlchemy internals).
    """
    new_code = Code(**code)
    db.add(new_code)
    db.commit()
    db.refresh(new_code)  # refresh to get generated fields like code_id

    # Log creation for audit purposes
    log_add(db, user["name"], "code", new_code.code_id, new_code.__dict__, new_code)

    # Return cleaned dict (removes private fields like _sa_instance_state)
    return {k: v for k, v in new_code.__dict__.items() if not k.startswith("_")}


@router.put("/codes/{code_id}")
async def update_code(
    code_id: int,
    updated: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Update an existing code.

    Args:
        code_id (int): ID of the code to update.
        updated (dict): Fields and values to update.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message and updated code object.
    """
    code = db.query(Code).filter(Code.code_id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")

    # Apply updates field by field, logging only real changes
    for key, value in updated.items():
        if hasattr(code, key):
            old_value = getattr(code, key)
            if old_value != value:
                setattr(code, key, value)
                log_edit(
                    db, user["name"], "code",
                    code.code_id, key, old_value, value, code
                )

    db.commit()
    db.refresh(code)
    return {"message": "Code updated successfully", "code": code}


@router.delete("/codes/{code_id}")
async def delete_code(
    code_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Delete a code.

    Args:
        code_id (int): ID of the code to delete.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message after deletion.
    """
    code = db.query(Code).filter(Code.code_id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")

    # Log before deletion so we capture the data
    log_delete(db, user["name"], "code", code.code_id, code.__dict__, code)

    db.delete(code)
    db.commit()
    return {"detail": "Code deleted"}
