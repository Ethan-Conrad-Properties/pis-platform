from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Property(Base):
    __tablename__ = 'properties'
    
    yardi = Column(String, primary_key=True)
    address = Column(String, index=True) # index when u want a fast search (do it for stuff you search often)
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
    __tablename__ = 'contacts'

    contact_id = Column(Integer, primary_key=True, autoincrement=True)
    name= Column(String, index=True)
    office_number = Column(String)
    cell_number = Column(String)
    email = Column(String)

class Suite(Base):
    __tablename__ = 'suites'

    suite_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey('properties.yardi'), nullable=False)
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
    __tablename__ = 'services'

    service_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey('properties.yardi'), nullable=False)
    service_type = Column(String)
    vendor = Column(String, index=True)
    notes = Column(Text)
    paid_by = Column(String)

class Utility(Base):
    __tablename__ = 'utilities'

    utility_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey('properties.yardi'), nullable=False)
    service = Column(String)
    vendor = Column(String, index=True)
    account_number = Column(String)
    meter_number = Column(String)
    notes = Column(Text)
    paid_by = Column(String)

class Code(Base):
    __tablename__ = 'codes'

    code_id = Column(Integer, primary_key=True, autoincrement=True)
    property_yardi = Column(String, ForeignKey('properties.yardi'), nullable=False)
    description = Column(String, index=True)
    code = Column(String)
    notes = Column(Text)

# Association tables for many-to-many relationships
class SuiteContact(Base):
    __tablename__ = 'suite_contacts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    suite_id = Column(Integer, ForeignKey('suites.suite_id'), nullable=False)
    contact_id = Column(Integer, ForeignKey('contacts.contact_id'), nullable=False)

class ServiceContact(Base):
    __tablename__ = 'service_contacts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    service_id = Column(Integer, ForeignKey('services.service_id'), nullable=False)
    contact_id = Column(Integer, ForeignKey('contacts.contact_id'), nullable=False)

class UtilityContact(Base):
    __tablename__ = 'utility_contacts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    utility_id = Column(Integer, ForeignKey('utilities.utility_id'), nullable=False)
    contact_id = Column(Integer, ForeignKey('contacts.contact_id'), nullable=False)











