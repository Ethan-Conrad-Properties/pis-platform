from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Service, Contact, ServiceContact
from app.auth import verify_token
from app.helpers import log_add, log_edit, log_delete

router = APIRouter()

# Get all services for a property
@router.get("/services")
async def get_services(property_yardi: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    services = db.query(Service).filter(Service.property_yardi == property_yardi).all()
    services_data = []
    for sv in services:
        contact_links = db.query(ServiceContact).filter(ServiceContact.service_id == sv.service_id).all()
        contact_ids = [link.contact_id for link in contact_links]
        contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []
        service_dict = sv.__dict__.copy()
        service_dict["contacts"] = [c.__dict__ for c in contacts]
        services_data.append(service_dict)
    return services_data

# Create a new service
@router.post("/services")
async def create_service(service: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_service = Service(**service)
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    log_add(db, user["name"], "service", new_service.service_id, new_service.__dict__, new_service)
    return {k: v for k, v in new_service.__dict__.items() if not k.startswith('_')}

# Update a service
@router.put("/services/{service_id}")
async def update_service(service_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in updated.items():
        if hasattr(service, key):
            old_value = getattr(service, key)
            if old_value != value:
                setattr(service, key, value)
                log_edit(db, user["name"], "service", service.service_id, key, old_value, value, service)
    db.commit()
    db.refresh(service)
    return {"message": "Service updated successfully", "service": service}


# Delete a service
@router.delete("/services/{service_id}")
async def delete_service(service_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    log_delete(db, user["name"], "service", service.service_id, service.__dict__, service)
    db.delete(service)
    db.commit()
    return {"detail": "Service deleted"}