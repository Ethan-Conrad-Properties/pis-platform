from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# -------------------------------------------------------------------
# SQLAlchemy Models
# Defines all database tables for the PIS Platform.
# Each class represents a table, with relationships handled via
# foreign keys and association tables.
# -------------------------------------------------------------------

Base = declarative_base()


class Property(Base):
    """
    Core property table.

    Each property is identified by a Yardi code (primary key) and
    contains high-level details like address, building type, size,
    tax info, etc.
    """
    __tablename__ = "properties"

    yardi = Column(String, primary_key=True)
    address = Column(String, index=True)
    prop_photo = Column(String)
    city = Column(String, index=True)
    state = Column(String)
    zip = Column(Integer, index=True)
    building_type = Column(String, index=True)
    total_sq_ft = Column(Integer)
    prop_manager = Column(String, index=True)
    coe = Column(DateTime)
    year_built = Column(String)
    year_rent = Column(String)
    num_buildings = Column(String)
    num_stories = Column(String)
    apn = Column(String)
    prop_tax_id = Column(String)
    parking = Column(String)
    fire_sprinklers = Column(String)
    net_rentable_area = Column(String)
    land_area = Column(String)
    structural_frame = Column(String)
    foundation = Column(String)
    roof_type = Column(String)
    roof_cover = Column(String)
    heat_cooling_source = Column(String)
    misc = Column(String)
    active = Column(Boolean, default=True)


class Contact(Base):
    """
    Generic contact table.

    Contacts can be linked to suites, services, or utilities via
    join tables.
    """
    __tablename__ = "contacts"

    contact_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True)
    office_number = Column(String)
    cell_number = Column(String)
    email = Column(String)


class Suite(Base):
    """
    Suite within a property.

    Each suite belongs to a property (property_yardi).
    Can store notes, HVAC details, codes, parking, etc.
    """
    __tablename__ = "suites"

    suite_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey("properties.yardi"), nullable=False)
    suite = Column(String)
    sqft = Column(String)
    name = Column(String, index=True)
    notes = Column(Text)
    hvac = Column(Text)
    hvac_info = Column(Text)
    commercial_cafe = Column(String)
    door_access_codes = Column(Text)
    lease_obligations = Column(Text)
    signage_rights = Column(Text)
    parking_spaces = Column(Text)
    electrical_amperage = Column(Text)
    misc = Column(Text)


class Service(Base):
    """
    Service record for a property.

    Example: Landscaping, janitorial, security.
    Linked to a property and optionally linked to contacts.
    """
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey("properties.yardi"), nullable=False)
    service_type = Column(String, index=True)
    vendor = Column(String, index=True)
    notes = Column(Text)
    paid_by = Column(String)
    tenant_specifics = Column(Text)
    suite_specifics = Column(Text)


class Utility(Base):
    """
    Utility record for a property.

    Example: Electricity, water, gas.
    Linked to a property and optionally linked to contacts.
    """
    __tablename__ = "utilities"

    utility_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey("properties.yardi"), nullable=False)
    service = Column(String, index=True)
    vendor = Column(String, index=True)
    account_number = Column(String)
    meter_number = Column(String)
    notes = Column(Text)
    paid_by = Column(String)


class Code(Base):
    """
    Code record for a property.

    Example: Security code, alarm code, access code.
    """
    __tablename__ = "codes"

    code_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey("properties.yardi"), nullable=False)
    description = Column(String, index=True)
    code = Column(String)
    notes = Column(Text)

class Permit(Base):
    """
    Permit record for a property.
    
    Stores things like issue date, exp date, renewal info, etc.
    """

    __tablename__ = "permits"

    permit_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey("properties.yardi"), nullable=False)
    municipality = Column(String, index=True)
    equip = Column(String, index=True)
    permit_number = Column(String)
    issue_date = Column(String)
    exp_date = Column(String)
    renewal_info = Column(Text)
    annual_report = Column(Text)
    login_creds = Column(Text)
    notes = Column(Text)


class PropertyPhoto(Base):
    """
    Photo record for a property.

    Stores a photo URL + optional caption.
    """
    __tablename__ = "property_photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey("properties.yardi"), nullable=False)
    photo_url = Column(String, nullable=False)
    caption = Column(Text)


# -------------------------------------------------------------------
# Association Tables (Many-to-Many)
# -------------------------------------------------------------------

class SuiteContact(Base):
    """
    Join table linking suites <-> contacts.
    """
    __tablename__ = "suite_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    suite_id = Column(Integer, ForeignKey("suites.suite_id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.contact_id"), nullable=False)


class ServiceContact(Base):
    """
    Join table linking services <-> contacts.
    """
    __tablename__ = "service_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.contact_id"), nullable=False)


class UtilityContact(Base):
    """
    Join table linking utilities <-> contacts.
    """
    __tablename__ = "utility_contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    utility_id = Column(Integer, ForeignKey("utilities.utility_id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.contact_id"), nullable=False)


class EditHistory(Base):
    """
    Audit log table.

    Records all add/edit/delete actions performed on entities,
    including who made the change, when, and what field/value changed.
    """
    __tablename__ = "edit_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    edited_by = Column(String, index=True)
    edited_at = Column(DateTime, default=datetime.now())
    entity_type = Column(String, index=True)   # e.g. "property", "suite"
    entity_id = Column(String, index=True)     # ID of the entity affected
    changes = Column(Text)                     # Field changed or action
    old_value = Column(Text)
    new_value = Column(Text)
    action = Column(String, index=True)        # "add", "edit", "delete"
