from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Property, Suite, Service, Utility, Code

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
async def get_properties(db: Session = Depends(get_db)):
    properties = db.query(Property).all()
    result = []
    for prop in properties:
        suites = db.query(Suite).filter(Suite.property_yardi == prop.yardi).all()
        services = db.query(Service).filter(Service.property_yardi == prop.yardi).all()
        utilities = db.query(Utility).filter(Utility.property_yardi == prop.yardi).all()
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
            "suites": [s.__dict__ for s in suites],
            "services": [sv.__dict__ for sv in services],
            "utilities": [u.__dict__ for u in utilities],
            "codes": [c.__dict__ for c in codes],
        })
    return {"properties": result}

# update a property
@router.put("/properties/{yardi}")
async def update_property(yardi: str, updated: dict = Body(...), db: Session = Depends(get_db)):
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
async def update_suite(suite_id: int, updated: dict = Body(...), db: Session = Depends(get_db)):
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
async def update_service(service_id: int, updated: dict = Body(...), db: Session = Depends(get_db)):
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
async def update_utility(utility_id: int, updated: dict = Body(...), db: Session = Depends(get_db)):
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
async def update_code(code_id: int, updated: dict = Body(...), db: Session = Depends(get_db)):
    code = db.query(Code).filter(Code.code_id == code_id).first()
    if not code:
        raise HTTPException(status_code=404, detail="Code not found")
    for key, value in updated.items():
        if hasattr(code, key):
            setattr(code, key, value)
    db.commit()
    db.refresh(code)
    return {"message": "Code updated successfully", "code": code}

    

