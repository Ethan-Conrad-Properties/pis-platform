from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    Property, Suite, Service, Utility, Code,
    SuiteContact, ServiceContact, UtilityContact, Contact
)
from app.auth import verify_token
from app.helpers import log_edit, log_add
from collections import defaultdict

router = APIRouter()

# -------------------------------------------------------------------
# CRUD Endpoints for Properties
# A Property is the core entity. It can have:
#   - Suites (linked via Suite)
#   - Services (linked via Service)
#   - Utilities (linked via Utility)
#   - Codes (linked via Code)
#   - Contacts (linked indirectly via join tables)
#
# This router supports:
#   - Listing properties with pagination
#   - Fetching a property (with nested data)
#   - Creating a property
#   - Updating a property
# -------------------------------------------------------------------

@router.get("/properties")
async def get_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get paginated list of properties with nested suites, services,
    utilities, codes, and contacts.

    Args:
        page (int): Page number (1-indexed).
        per_page (int): Number of items per page (max 100).
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Paginated response with total counts and property data.
    """
    # Count total properties
    total = db.query(func.count(Property.yardi)).scalar() or 0

    # Fetch paginated properties
    props = (
        db.query(Property)
        .order_by(Property.yardi)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    if not props:
        return {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page if total else 0,
            "properties": [],
        }

    yardis = [p.yardi for p in props]

    # Bulk fetch related children
    suites    = db.query(Suite).filter(Suite.property_yardi.in_(yardis)).all()
    services  = db.query(Service).filter(Service.property_yardi.in_(yardis)).all()
    utilities = db.query(Utility).filter(Utility.property_yardi.in_(yardis)).all()
    codes     = db.query(Code).filter(Code.property_yardi.in_(yardis)).all()

    # Collect IDs for join lookups
    suite_ids   = [s.suite_id for s in suites] or [None]
    service_ids = [sv.service_id for sv in services] or [None]
    utility_ids = [u.utility_id for u in utilities] or [None]

    # Fetch join table records
    suite_links   = db.query(SuiteContact).filter(SuiteContact.suite_id.in_(suite_ids)).all()
    service_links = db.query(ServiceContact).filter(ServiceContact.service_id.in_(service_ids)).all()
    utility_links = db.query(UtilityContact).filter(UtilityContact.utility_id.in_(utility_ids)).all()

    # Collect all contact IDs across join tables
    contact_ids = (
        {l.contact_id for l in suite_links} |
        {l.contact_id for l in service_links} |
        {l.contact_id for l in utility_links}
    )
    contacts = db.query(Contact).filter(Contact.contact_id.in_(contact_ids or [None])).all()
    contacts_by_id = {c.contact_id: c.__dict__.copy() for c in contacts}

    # Map contacts per suite/service/utility
    suite_contacts = defaultdict(list)
    for l in suite_links:
        c = contacts_by_id.get(l.contact_id)
        if c: suite_contacts[l.suite_id].append(c)

    service_contacts = defaultdict(list)
    for l in service_links:
        c = contacts_by_id.get(l.contact_id)
        if c: service_contacts[l.service_id].append(c)

    utility_contacts = defaultdict(list)
    for l in utility_links:
        c = contacts_by_id.get(l.contact_id)
        if c: utility_contacts[l.utility_id].append(c)

    # Group children by property_yardi
    suites_by_yardi = defaultdict(list)
    for s in suites:
        d = s.__dict__.copy()
        d["contacts"] = suite_contacts.get(s.suite_id, [])
        suites_by_yardi[s.property_yardi].append(d)

    services_by_yardi = defaultdict(list)
    for sv in services:
        d = sv.__dict__.copy()
        d["contacts"] = service_contacts.get(sv.service_id, [])
        services_by_yardi[sv.property_yardi].append(d)

    utilities_by_yardi = defaultdict(list)
    for u in utilities:
        d = u.__dict__.copy()
        d["contacts"] = utility_contacts.get(u.utility_id, [])
        utilities_by_yardi[u.property_yardi].append(d)

    codes_by_yardi = defaultdict(list)
    for c in codes:
        codes_by_yardi[c.property_yardi].append(c.__dict__.copy())

    # Assemble final response
    result = []
    for prop in props:
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
            "suites":    suites_by_yardi.get(prop.yardi, []),
            "services":  services_by_yardi.get(prop.yardi, []),
            "utilities": utilities_by_yardi.get(prop.yardi, []),
            "codes":     codes_by_yardi.get(prop.yardi, []),
        })

    return {
        "page": page,
        "per_page": per_page,
        "total": total,
        "total_pages": (total + per_page - 1) // per_page if total else 0,
        "properties": result,
    }


@router.get("/properties/{yardi}")
async def get_property_by_yardi(
    yardi: str,
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Get a single property by its yardi ID, with all nested data.

    Args:
        yardi (str): Property identifier.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Property details with suites, services, utilities, and codes.
    """
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


@router.put("/properties/{yardi}")
async def update_property(
    yardi: str,
    updated: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Update an existing property.

    Args:
        yardi (str): Property identifier.
        updated (dict): Fields and values to update.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Confirmation message and updated property.
    """
    property = db.query(Property).filter(Property.yardi == yardi).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    for key, value in updated.items():
        if hasattr(property, key):
            old_value = getattr(property, key)
            if old_value != value:
                setattr(property, key, value)
                # Log only real changes
                log_edit(
                    db, user["name"], "property",
                    property.yardi, key, old_value, value, entity_obj=property
                )

    db.commit()
    db.refresh(property)
    return {"message": "Property updated successfully", "property": property}


@router.post("/properties")
async def create_property(
    property: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(verify_token),
):
    """
    Create a new property.

    Args:
        property (dict): Request body containing property fields.
        db (Session): Database session.
        user (dict): Authenticated user.

    Returns:
        dict: Newly created property (cleaned of SQLAlchemy internals).
    """
    new_property = Property(**property)
    db.add(new_property)
    db.commit()
    db.refresh(new_property)

    # Log creation for audit history
    log_add(db, user["name"], "property", new_property.yardi, new_property, entity_obj=new_property)

    return {k: v for k, v in new_property.__dict__.items() if not k.startswith("_")}
