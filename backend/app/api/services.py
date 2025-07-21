from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Service, Contact, ServiceContact
from app.auth import verify_token

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# Get all services for a property
@router.get("/services")
async def get_services(property_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    services = db.query(Service).filter(Service.property_yardi == property_id).all()
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
    return {k: v for k, v in new_service.__dict__.items() if not k.startswith('_')}

# Update a service
@router.put("/services/{service_id}")
async def update_service(service_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in updated.items():
        if hasattr(service, key):
            setattr(service, key, value)
    db.commit()
    db.refresh(service)
    return {"message": "Service updated successfully", "service": service}