/**
 * cardFields.js
 * ----------------
 * Centralized definitions of field metadata for different entities
 * (properties, suites, services, utilities, codes).
 *
 * Each array contains objects describing:
 *  - label: human-readable field name
 *  - name/id: the key in the database / API response
 *
 * Purpose:
 *  - Keeps UI forms and cards consistent
 *  - Avoids hardcoding labels and keys in multiple places
 *  - Makes it easy to loop over fields dynamically in components
 */

export const propertyFields = [
  { label: "Yardi", name: "yardi" },
  { label: "City", name: "city" },
  { label: "State", name: "state" },
  { label: "Zip", name: "zip" },
  { label: "Building Type", name: "building_type" },
  { label: "Total Sq Ft", name: "total_sq_ft" },
  { label: "Property Manager", name: "prop_manager" },
  { label: "COE", name: "coe" },
  { label: "Year Built", name: "year_built" },
  { label: "Year Rent", name: "year_rent" },
  { label: "Num Buildings", name: "num_buildings" },
  { label: "Num Stories", name: "num_stories" },
  { label: "APN", name: "apn" },
  { label: "Prop Tax ID", name: "prop_tax_id" },
  { label: "Parking", name: "parking" },
  { label: "Fire Sprinklers", name: "fire_sprinklers" },
  { label: "Net Rentable Area", name: "net_rentable_area" },
  { label: "Land Area", name: "land_area" },
  { label: "Structural Frame", name: "structural_frame" },
  { label: "Foundation", name: "foundation" },
  { label: "Roof Type", name: "roof_type" },
  { label: "Roof Cover", name: "roof_cover" },
  { label: "Heat/Cooling Source", name: "heat_cooling_source" },
  { label: "Misc", name: "misc" },
];

export const suiteFields = [
  { id: "suite", label: "Suite" },
  { id: "sqft", label: "Sqft" },
  { id: "name", label: "Name" },
  { id: "contact", label: "Contacts" },
  { id: "notes", label: "Notes" },
  { id: "hvac", label: "HVAC" },
  { id: "hvac_info", label: "HVAC Info" },
  { id: "commercial_cafe", label: "Commercial Cafe" },
  { id: "door_access_codes", label: "Door Access Codes" },
  { id: "lease_obligations", label: "Lease Obligations" },
  { id: "signage_rights", label: "Signage Rights" },
  { id: "parking_spaces", label: "Parking Spaces" },
  { id: "electrical_amperage", label: "Electrical Amperage" },
  { id: "misc", label: "Misc" },
];

export const serviceFields = [
  { id: "service_type", label: "Type" },
  { id: "vendor", label: "Vendor" },
  { id: "contact", label: "Contacts" },
  { id: "notes", label: "Notes" },
  { id: "paid_by", label: "Paid By" },
];

export const utilityFields = [
  { id: "service", label: "Service" },
  { id: "vendor", label: "Vendor" },
  { id: "contact", label: "Contacts" },
  { id: "account_number", label: "Account #" },
  { id: "meter_number", label: "Meter #" },
  { id: "notes", label: "Notes" },
  { id: "paid_by", label: "Paid By" },
];

export const codeFields = [
  { id: "description", label: "Description" },
  { id: "code", label: "Code" },
  { id: "notes", label: "Notes" },
];
