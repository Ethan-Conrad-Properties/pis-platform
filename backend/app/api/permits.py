from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Permit
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Permits
# Each "Permit" belongs to a property (via property_yardi).
# Logs are written on create, update, and delete for audit history.
# -------------------------------------------------------------------

@router.get("/permits")
async def get_permits(
    property_yardi: str,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get all permits for a given property.

    Args:
        property_yardi (str): Unique identifier for the property.
        db (Session): Database session (injected by FastAPI).
        user (dict): Authenticated user (from token).

    Returns:
        list[dict]: All permits linked to the property.
    """
    permits = (
        db.query(Permit)
        .filter(Permit.property_yardi == property_yardi)
        .order_by(Permit.municipality.asc())
        .all()
    )
    return [p.__dict__ for p in permits]


@router.post("/permits", status_code=201)
async def create_permit(
    permit: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Create a new permit for a property.

    Args:
        permit (dict): Request body containing permit fields.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Newly created permit (cleaned of SQLAlchemy internals).
    """
    new_permit = Permit(**permit)
    db.add(new_permit)
    db.commit()
    db.refresh(new_permit)  # refresh to get generated fields like permit_id

    # Log creation for audit purposes
    log_add(
        db,
        user["name"],
        "permit",
        new_permit.permit_id,
        new_permit.__dict__,
        new_permit,
    )

    # Return cleaned dict (removes private fields like _sa_instance_state)
    return {k: v for k, v in new_permit.__dict__.items() if not k.startswith("_")}


@router.put("/permits/{permit_id}")
async def update_permit(
    permit_id: int,
    updated: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Update an existing permit.

    Args:
        permit_id (int): ID of the permit to update.
        updated (dict): Fields and values to update.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message and updated permit object.
    """
    permit = db.query(Permit).filter(Permit.permit_id == permit_id).first()
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")

    # Apply updates field by field, logging only real changes
    for key, value in updated.items():
        if hasattr(permit, key):
            old_value = getattr(permit, key)
            if old_value != value:
                setattr(permit, key, value)
                log_edit(
                    db,
                    user["name"],
                    "permit",
                    permit.permit_id,
                    key,
                    old_value,
                    value,
                    permit,
                )

    db.commit()
    db.refresh(permit)
    return {"message": "Permit updated successfully", "permit": permit}


@router.delete("/permits/{permit_id}")
async def delete_permit(
    permit_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Delete a permit.

    Args:
        permit_id (int): ID of the permit to delete.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message after deletion.
    """
    permit = db.query(Permit).filter(Permit.permit_id == permit_id).first()
    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")

    # Log before deletion so we capture the data
    log_delete(
        db,
        user["name"],
        "permit",
        permit.permit_id,
        permit.__dict__,
        permit,
    )

    db.delete(permit)
    db.commit()
    return {"detail": "Permit deleted"}
