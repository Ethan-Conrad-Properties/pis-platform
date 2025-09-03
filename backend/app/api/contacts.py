from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SuiteContact, ServiceContact, UtilityContact, Contact
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Contacts
# Contacts can be linked to suites, services, or utilities.
# Linking is handled through join tables (SuiteContact, ServiceContact, UtilityContact).
# Logs are written on create, update, and delete for audit history.
# -------------------------------------------------------------------

@router.put("/contacts/{contact_id}")
async def update_contact(
    contact_id: int,
    updated: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Update an existing contact.

    Args:
        contact_id (int): ID of the contact to update.
        updated (dict): Fields and values to update.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Updated contact (cleaned of SQLAlchemy internals).
    """
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Apply updates field by field, logging only changes
    for key, value in updated.items():
        if hasattr(contact, key):
            old_value = getattr(contact, key)
            if old_value != value:
                setattr(contact, key, value)
                log_edit(
                    db, user["name"], "contact",
                    contact.contact_id, key, old_value, value, contact
                )

    db.commit()
    db.refresh(contact)
    return {k: v for k, v in contact.__dict__.items() if not k.startswith("_")}


@router.post("/contacts", status_code=201)
async def create_contact(
    contact: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Create a new contact and optionally link it to a suite, service, or utility.

    Args:
        contact (dict): Request body containing contact fields + optional suite_id/service_id/utility_id.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Newly created contact (cleaned of SQLAlchemy internals).
    """
    # Remove linking fields before creating the base Contact
    contact_data = {k: v for k, v in contact.items() if k not in ["suite_id", "service_id", "utility_id"]}
    new_contact = Contact(**contact_data)
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    # Log creation for audit purposes
    log_add(db, user["name"], "contact", new_contact.contact_id, new_contact.__dict__, new_contact)

    # Link to suite/service/utility if provided
    if "suite_id" in contact and contact["suite_id"]:
        db.add(SuiteContact(suite_id=contact["suite_id"], contact_id=new_contact.contact_id))
    if "service_id" in contact and contact["service_id"]:
        db.add(ServiceContact(service_id=contact["service_id"], contact_id=new_contact.contact_id))
    if "utility_id" in contact and contact["utility_id"]:
        db.add(UtilityContact(utility_id=contact["utility_id"], contact_id=new_contact.contact_id))
    db.commit()

    return {k: v for k, v in new_contact.__dict__.items() if not k.startswith("_")}


@router.delete("/contacts/{contact_id}")
async def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Delete a contact and remove any associated links.

    Args:
        contact_id (int): ID of the contact to delete.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message after deletion.
    """
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Remove links from join tables first
    db.query(SuiteContact).filter(SuiteContact.contact_id == contact_id).delete()
    db.query(ServiceContact).filter(ServiceContact.contact_id == contact_id).delete()
    db.query(UtilityContact).filter(UtilityContact.contact_id == contact_id).delete()

    # Log before deleting the contact itself
    log_delete(db, user["name"], "contact", contact.contact_id, contact.__dict__, contact)

    db.delete(contact)
    db.commit()
    return {"detail": "Contact deleted"}
