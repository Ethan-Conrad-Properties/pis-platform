from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Property, Suite, Service, Utility, Code, SuiteContact, ServiceContact, UtilityContact, Contact
from app.auth import verify_token
from app.helpers import log_edit, log_add

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

# Get all properties (with nested suites, services, utilities, codes, and contacts)
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
            "active": prop.active,
            "suites": suites_data,
            "services": services_data,
            "utilities": utilities_data,
            "codes": [c.__dict__ for c in codes],
        })
    return {"properties": result}

# Get a single property by yardi (with nested data)
@router.get("/properties/{yardi}")
async def get_property_by_yardi(yardi: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    prop = db.query(Property).filter(Property.yardi == yardi).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

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

    return {
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
        "active": prop.active,
        "suites": suites_data,
        "services": services_data,
        "utilities": utilities_data,
        "codes": [c.__dict__ for c in codes],
    }

# Update a property
@router.put("/properties/{yardi}")
async def update_property(yardi: str, updated: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    property = db.query(Property).filter(Property.yardi == yardi).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    for key, value in updated.items():
        if hasattr(property, key):
            old_value = getattr(property, key)
            if old_value != value:
                setattr(property, key, value)
                # Log the edit
                log_edit(db, user["name"], "property", property.yardi, key, old_value, value)
    db.commit()
    db.refresh(property)
    return {"message": "Property updated successfully", "property": property}

# Create a new property
@router.post("/properties")
async def create_property(property: dict = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    new_property = Property(**property)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    # Log the creation
    log_add(db, user["username"], "property", new_property.yardi, new_property)
    return {k: v for k, v in new_property.__dict__.items() if not k.startswith('_')}

