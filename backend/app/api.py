from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Property, Suite, Service, Utility, Code, SuiteContact, ServiceContact, UtilityContact, Contact
from app.auth import verify_token

# gets DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# get all properties
@router.get("/properties")
async def get_properties(db: Session = Depends(get_db), user=Depends(verify_token)):
    properties = db.query(Property).all()
    result = []
    for prop in properties:
        # Suites with contacts
        suites = db.query(Suite).filter(Suite.property_yardi == prop.yardi).all()
        suites_data = []
        for s in suites:
            contact_links = db.query(SuiteContact).filter(SuiteContact.suite_id == s.suite_id).all()
            contact_ids = [link.contact_id for link in contact_links]
            contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []
            suite_dict = s.__dict__.copy()
            suite_dict["contacts"] = [c.__dict__ for c in contacts]
            suites_data.append(suite_dict)

        # Services with contacts
        services = db.query(Service).filter(Service.property_yardi == prop.yardi).all()
        services_data = []
        for sv in services:
            contact_links = db.query(ServiceContact).filter(ServiceContact.service_id == sv.service_id).all()
            contact_ids = [link.contact_id for link in contact_links]
            contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []
            service_dict = sv.__dict__.copy()
            service_dict["contacts"] = [c.__dict__ for c in contacts]
            services_data.append(service_dict)

        # Utilities with contacts
        utilities = db.query(Utility).filter(Utility.property_yardi == prop.yardi).all()
        utilities_data = []
        for u in utilities:
            contact_links = db.query(UtilityContact).filter(UtilityContact.utility_id == u.utility_id).all()
            contact_ids = [link.contact_id for link in contact_links]
            contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids)).all() if contact_ids else []
            utility_dict = u.__dict__.copy()
            utility_dict["contacts"] = [c.__dict__ for c in contacts]
            utilities_data.append(utility_dict)

        codes = db.query(Code).filter(Code.property_yardi == prop.yardi).all()

        result.append({
            "yardi": prop.yardi,
            "address": prop.address,
            "prop_photo": prop.prop_photo,
            "city": prop.city,
            "state": prop.state,
            "zip": prop.zip,
            "building_type": prop.building_type,
            "total_sq_ft": prop.total_sq_ft,
            "prop_manager": prop.prop_manager,
            "coe": prop.coe,
            "year_built": prop.year_built,
            "year_rent": prop.year_rent,
            "num_buildings": prop.num_buildings,
            "num_stories": prop.num_stories,
            "apn": prop.apn,
            "prop_tax_id": prop.prop_tax_id,
            "parking": prop.parking,
            "fire_sprinklers": prop.fire_sprinklers,
            "net_rentable_area": prop.net_rentable_area,
            "land_area": prop.land_area,
            "structural_frame": prop.structural_frame,
            "foundation": prop.foundation,
            "roof_type": prop.roof_type,
            "roof_cover": prop.roof_cover,
            "heat_cooling_source": prop.heat_cooling_source,
            "misc": prop.misc,
            "suites": suites_data,
            "services": services_data,
            "utilities": utilities_data,
            "codes": [c.__dict__ for c in codes],
        })
    return {"properties": result}

# Get all suites for a property
@router.get("/suites")
async def get_suites(property_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    suites = db.query(Suite).filter(Suite.property_yardi == property_id).all()
    return [s.__dict__ for s in suites]

# Get all services for a property
@router.get("/services")
async def get_services(property_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    services = db.query(Service).filter(Service.property_yardi == property_id).all()
    return [s.__dict__ for s in services]

# Get all utilities for a property
@router.get("/utilities")
async def get_utilities(property_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    utilities = db.query(Utility).filter(Utility.property_yardi == property_id).all()
    return [u.__dict__ for u in utilities]

# Get all codes for a property
@router.get("/codes")
async def get_codes(property_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    codes = db.query(Code).filter(Code.property_yardi == property_id).all()
    return [c.__dict__ for c in codes]

# update a property
@router.put("/properties/{yardi}")
async def update_property(yardi: str, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    property = db.query(Property).filter(Property.yardi == yardi).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    for key, value in updated.items():
        if hasattr(property, key):
            setattr(property, key, value)
    db.commit()
    db.refresh(property)
    return {"message": "Property updated successfully", "property": property}

# Update a suite
@router.put("/suites/{suite_id}")
async def update_suite(suite_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    suite = db.query(Suite).filter(Suite.suite_id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail="Suite not found")
    for key, value in updated.items():
        if hasattr(suite, key):
            setattr(suite, key, value)
    db.commit()
    db.refresh(suite)
    return {"message": "Suite updated successfully", "suite": suite}

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
    return {"message": "Utility updated successfully", "utility": utility}

# Update a code
@router.put("/codes/{code_id}")
async def update_code(code_id: int, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    code = db.query(Code).filter(Code.code_id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    for key, value in updated.items():
        if hasattr(code, key):
            setattr(code, key, value)
    db.commit()
    db.refresh(code)
    return {"message": "Code updated successfully", "code": code}

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
    
# create a new property
@router.post("/properties")
async def create_property(property: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    # Optionally, check for required fields here
    new_property = Property(**property)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    return {k: v for k, v in new_property.__dict__.items() if not k.startswith('_')}

# Create a new suite
@router.post("/suites")
async def create_suite(suite: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_suite = Suite(**suite)
    db.add(new_suite)
    db.commit()
    db.refresh(new_suite)
    return {k: v for k, v in new_suite.__dict__.items() if not k.startswith('_')}

# Create a new service
@router.post("/services")
async def create_service(service: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_service = Service(**service)
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return {k: v for k, v in new_service.__dict__.items() if not k.startswith('_')}

# Create a new utility
@router.post("/utilities")
async def create_utility(utility: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_utility = Utility(**utility)
    db.add(new_utility)
    db.commit()
    db.refresh(new_utility)
    return {k: v for k, v in new_utility.__dict__.items() if not k.startswith('_')}

# Create a new code
@router.post("/codes")
async def create_code(code: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_code = Code(**code)
    db.add(new_code)
    db.commit()
    db.refresh(new_code)
    return {k: v for k, v in new_code.__dict__.items() if not k.startswith('_')}

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


