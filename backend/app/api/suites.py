from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Suite, Contact, SuiteContact
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Suites
# Each suite belongs to a property (via property_yardi).
# Contacts are linked through the SuiteContact join table.
# Logs are written on create, update, and delete for audit history.
# -------------------------------------------------------------------

@router.get("/suites")
async def get_suites(
    property_yardi: str,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get all suites for a given property.

    Args:
        property_yardi (str): Property identifier.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        list[dict]: List of suites with nested contacts.
    """
    suites = (
        db.query(Suite)
        .filter(Suite.property_yardi == property_yardi)
        .order_by(Suite.suite.asc())
        .all()
    )

    suites_data = []
    for s in suites:
        # Fetch linked contacts for this suite
        contact_links = db.query(SuiteContact).filter(SuiteContact.suite_id == s.suite_id).all()
        contact_ids = [link.contact_id for link in contact_links]
        contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []

        suite_dict = s.__dict__.copy()
        suite_dict["contacts"] = [c.__dict__ for c in contacts]
        suites_data.append(suite_dict)

    return suites_data


@router.post("/suites", status_code=201)
async def create_suite(
    suite: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Create a new suite for a property.

    Args:
        suite (dict): Request body containing suite fields.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Newly created suite (cleaned of SQLAlchemy internals).
    """
    new_suite = Suite(**suite)
    db.add(new_suite)
    db.commit()
    db.refresh(new_suite)

    # Log creation for audit trail
    log_add(db, user["name"], "suite", new_suite.suite_id, new_suite.__dict__, new_suite)

    return {k: v for k, v in new_suite.__dict__.items() if not k.startswith("_")}


@router.put("/suites/{suite_id}")
async def update_suite(
    suite_id: int,
    updated: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Update an existing suite.

    Args:
        suite_id (int): ID of the suite to update.
        updated (dict): Fields and values to update.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Updated suite (cleaned of SQLAlchemy internals).
    """
    suite = db.query(Suite).filter(Suite.suite_id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail="Suite not found")

    # Apply updates field by field, logging only real changes
    for key, value in updated.items():
        if hasattr(suite, key):
            old_value = getattr(suite, key)
            if old_value != value:
                setattr(suite, key, value)
                log_edit(
                    db, user["name"], "suite",
                    suite.suite_id, key, old_value, value, suite
                )

    db.commit()
    db.refresh(suite)
    return {k: v for k, v in suite.__dict__.items() if not k.startswith("_")}


@router.delete("/suites/{suite_id}")
async def delete_suite(
    suite_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Delete a suite.

    Args:
        suite_id (int): ID of the suite to delete.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message after deletion.
    """
    suite = db.query(Suite).filter(Suite.suite_id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail="Suite not found")

    # Log before deletion
    log_delete(db, user["name"], "suite", suite.suite_id, suite.__dict__, suite)

    db.delete(suite)
    db.commit()
    return {"detail": "Suite deleted"}
