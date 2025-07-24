from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Utility, Contact, UtilityContact
from app.auth import verify_token

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# Get all utilities for a property
@router.get("/utilities")
async def get_utilities(property_yardi: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    utilities = db.query(Utility).filter(Utility.property_yardi == property_yardi).all()
    utilities_data = []
    for u in utilities:
        contact_links = db.query(UtilityContact).filter(UtilityContact.utility_id == u.utility_id).all()
        contact_ids = [link.contact_id for link in contact_links]
        contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []
        utility_dict = u.__dict__.copy()
        utility_dict["contacts"] = [c.__dict__ for c in contacts]
        utilities_data.append(utility_dict)
    return utilities_data

# Create a new utility
@router.post("/utilities")
async def create_utility(utility: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_utility = Utility(**utility)
    db.add(new_utility)
    db.commit()
    db.refresh(new_utility)
    return {k: v for k, v in new_utility.__dict__.items() if not k.startswith('_')}

# Update a utility
@router.put("/utilities/{utility_id}")
async def update_utility(utility_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    utility = db.query(Utility).filter(Utility.utility_id == utility_id).first()
    if not utility:
        raise HTTPException(status_code=404, detail="Utility not found")
    for key, value in updated.items():
        if hasattr(utility, key):
            setattr(utility, key, value)
    db.commit()
    db.refresh(utility)
    return {"message": "Utility updated successfully", "utility": {k: v for k, v in utility.__dict__.items() if not k.startswith('_')}}