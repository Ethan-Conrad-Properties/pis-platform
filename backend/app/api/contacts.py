from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import SuiteContact, ServiceContact, UtilityContact, Contact
from app.auth import verify_token

# gets DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# update a contact
@router.put("/contacts/{contact_id}")
async def update_contact(contact_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    for key, value in updated.items():
        if hasattr(contact, key):
            setattr(contact, key, value)
    db.commit()
    db.refresh(contact)
    return {k: v for k, v in contact.__dict__.items() if not k.startswith('_')}

# add a contact
@router.post("/contacts")
async def create_contact(contact: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_contact = Contact(**contact)
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    # Link to suite/service/utility if provided
    if "suite_id" in contact and contact["suite_id"]:
        db.add(SuiteContact(suite_id=contact["suite_id"], contact_id=new_contact.contact_id))
    if "service_id" in contact and contact["service_id"]:
        db.add(ServiceContact(service_id=contact["service_id"], contact_id=new_contact.contact_id))
    if "utility_id" in contact and contact["utility_id"]:
        db.add(UtilityContact(utility_id=contact["utility_id"], contact_id=new_contact.contact_id))
    db.commit()

    return {k: v for k, v in new_contact.__dict__.items() if not k.startswith('_')}