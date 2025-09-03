from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Service, Contact, ServiceContact
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Services
# Each service belongs to a property (via property_yardi).
# Contacts are linked through the ServiceContact join table.
# Logs are written on create, update, and delete for audit history.
# -------------------------------------------------------------------

@router.get("/services")
async def get_services(
    property_yardi: str,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get all services for a given property.

    Args:
        property_yardi (str): Property identifier.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        list[dict]: List of services with nested contacts.
    """
    services = (
        db.query(Service)
        .filter(Service.property_yardi == property_yardi)
        .order_by(Service.service_type.asc(), Service.vendor.asc())
        .all()
    )

    services_data = []
    for sv in services:
        # Fetch linked contacts for this service
        contact_links = db.query(ServiceContact).filter(ServiceContact.service_id == sv.service_id).all()
        contact_ids = [link.contact_id for link in contact_links]
        contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []

        service_dict = sv.__dict__.copy()
        service_dict["contacts"] = [c.__dict__ for c in contacts]
        services_data.append(service_dict)

    return services_data


@router.post("/services", status_code=201)
async def create_service(
    service: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Create a new service for a property.

    Args:
        service (dict): Request body containing service fields.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Newly created service (cleaned of SQLAlchemy internals).
    """
    new_service = Service(**service)
    db.add(new_service)
    db.commit()
    db.refresh(new_service)

    # Log creation for audit trail
    log_add(db, user["name"], "service", new_service.service_id, new_service.__dict__, new_service)

    return {k: v for k, v in new_service.__dict__.items() if not k.startswith("_")}


@router.put("/services/{service_id}")
async def update_service(
    service_id: int,
    updated: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Update an existing service.

    Args:
        service_id (int): ID of the service to update.
        updated (dict): Fields and values to update.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message and updated service.
    """
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Apply updates field by field, logging only real changes
    for key, value in updated.items():
        if hasattr(service, key):
            old_value = getattr(service, key)
            if old_value != value:
                setattr(service, key, value)
                log_edit(
                    db, user["name"], "service",
                    service.service_id, key, old_value, value, service
                )

    db.commit()
    db.refresh(service)
    return {"message": "Service updated successfully", "service": service}


@router.delete("/services/{service_id}")
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Delete a service.

    Args:
        service_id (int): ID of the service to delete.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message after deletion.
    """
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Log before deletion
    log_delete(db, user["name"], "service", service.service_id, service.__dict__, service)

    db.delete(service)
    db.commit()
    return {"detail": "Service deleted"}
