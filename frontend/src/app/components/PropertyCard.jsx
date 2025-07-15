import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SubSectionCard from './SubSectionCard';
import SuccessModal from './SuccessModal';

export default function PropertyCard({ property, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ...property,
    suites: property.suites || [],
    services: property.services || [],
    utilities: property.utilities || [],
    codes: property.codes || []
  });
	
	const [showModal, setShowModal] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	useEffect(() => {
		setForm({
			...property,
			suites: property.suites || [],
			services: property.services || [],
			utilities: property.utilities || [],
			codes: property.codes || []
		});
	}, [property]);

  // Handle property field changes
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle suite/service/utility/code field changes
	const handleSubChange = (type, idx, field, value) => {
		setForm(prevForm => {
			const updated = prevForm[type].map((item, i) =>
				i === idx ? { ...item, [field]: value } : item
			);
			return { ...prevForm, [type]: updated };
		});
	};

  // Save property and all sub-records
  const handleSave = async (section, idx = null) => {
    try {
    if (section === "property") {
      await axios.put(`${apiUrl}/properties/${property.yardi}`, form);
    } else if (section === "suites" && idx !== null) {
      const suite = form.suites[idx];
      await axios.put(`${apiUrl}/suites/${suite.suite_id}`, suite);
    } else if (section === "services" && idx !== null) {
      const service = form.services[idx];
      await axios.put(`${apiUrl}/services/${service.service_id}`, service);
    } else if (section === "utilities" && idx !== null) {
      const utility = form.utilities[idx];
      await axios.put(`${apiUrl}/utilities/${utility.utility_id}`, utility);
    } else if (section === "codes" && idx !== null) {
      const code = form.codes[idx];
      await axios.put(`${apiUrl}/codes/${code.code_id}`, code);
    }
    setEditing(false);
    setShowModal(true);
    if (onUpdate) onUpdate(form);
  } catch (error) {
    alert('Error updating property or related records');
  }
};

	const handleCloseModal = () => setShowModal(false);

  const renderField = (label, name, type = "text") => (
    <div className="mb-2">
      <label className="block font-semibold">{label}:</label>
      {editing ? (
        <input
          type={type}
          name={name}
          value={
            name === "coe"
              ? formatDate(form[name])
              : (form[name] ?? '')
          }
          onChange={handleChange}
          className="p-1 border border-gray-300 rounded w-full"
        />
      ) : (
        <span className="break-all inline-block align-bottom">
          {name === "coe" ? formatDate(property[name]) : property[name]}
        </span>
      )}
    </div>
  );

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  return (
    <div className="bg-white rounded shadow-2xl p-4">
			<SuccessModal open={showModal} onClose={handleCloseModal} />
      <div className="flex items-center justify-between text-lg mb-2">
        {renderField("Address", "address")}
        <button
          onClick={() => setEditing(e => !e)}
          className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      {property.prop_photo && !editing && (
        <img 
					src={property.prop_photo} alt="Property" 
					className="mb-2 mx-auto w-full max-w-2xl h-64 object-cover rounded"
					style={{ display: 'block' }}
 				/>
      )}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 space-x-2 text-xs md:text-sm">
        {renderField("Yardi", "yardi")}
        {renderField("City", "city")}
        {renderField("State", "state")}
        {renderField("Zip", "zip")}
        {renderField("Building Type", "building_type")}
        {renderField("Total Sq Ft", "total_sq_ft")}
        {renderField("Property Manager", "prop_manager")}
        {renderField("COE", "coe")}
        {renderField("Year Built", "year_built")}
        {renderField("Year Rent", "year_rent")}
        {renderField("Num Buildings", "num_buildings")}
        {renderField("Num Stories", "num_stories")}
        {renderField("APN", "apn")}
        {renderField("Prop Tax ID", "prop_tax_id")}
        {renderField("Parking", "parking")}
        {renderField("Fire Sprinklers", "fire_sprinklers")}
        {renderField("Net Rentable Area", "net_rentable_area")}
        {renderField("Land Area", "land_area")}
        {renderField("Structural Frame", "structural_frame")}
        {renderField("Foundation", "foundation")}
        {renderField("Roof Type", "roof_type")}
        {renderField("Roof Cover", "roof_cover")}
        {renderField("Heat/Cooling Source", "heat_cooling_source")}
        {renderField("Misc", "misc")}
      </div>

      {editing && (
        <div className="mt-2">
          <button onClick={() => handleSave("property")} className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer">Save</button>
        </div>
      )}

      {/* Suites */}
      <SubSectionCard
        type="suites"
        items={form.suites}
        fields={[
          { id: "suite", label: "Suite" },
          { id: "sqft", label: "Sqft" },
          { id: "name", label: "Name" },
          { id: "contact", label: "Contact" },
          { id: "phone_number", label: "Phone" },
          { id: "email_address", label: "Email" },
          { id: "notes", label: "Notes" },
          { id: "hvac", label: "HVAC" },
          { id: "hvac_info", label: "HVAC Info" },
          { id: "commercial_cafe", label: "Commercial Cafe" },
          { id: "door_access_codes", label: "Door Access Codes" },
          { id: "lease_obligations", label: "Lease Obligations" },
          { id: "signage_rights", label: "Signage Rights" },
          { id: "parking_spaces", label: "Parking Spaces" },
          { id: "electrical_amperage", label: "Electrical Amperage" },
          { id: "misc", label: "Misc" }
        ]}
        label="Suites"
        onChange={handleSubChange}
        onSave={handleSave}
      />

      {/* Services */}
      <SubSectionCard
        type="services"
        items={form.services}
        fields={[
          { id: "service_type", label: "Type" },
          { id: "vendor", label: "Vendor" },
          { id: "contact", label: "Contact" },
          { id: "phone_number", label: "Phone" },
          { id: "email_address", label: "Email" },
          { id: "notes", label: "Notes" },
          { id: "paid_by", label: "Paid By" }
        ]}
        label="Services"
        onChange={handleSubChange}
        onSave={handleSave}
      />

      {/* Utilities */}
      <SubSectionCard
        type="utilities"
        items={form.utilities}
        fields={[
          { id: "service", label: "Service" },
          { id: "vendor", label: "Vendor" },
          { id: "contact_info", label: "Contact Info" },
          { id: "account_number", label: "Account #" },
          { id: "meter_number", label: "Meter #" },
          { id: "notes", label: "Notes" },
          { id: "paid_by", label: "Paid By" }
        ]}
        label="Utilities"
        onChange={handleSubChange}
        onSave={handleSave}
      />

      {/* Codes */}
      <SubSectionCard
        type="codes"
        items={form.codes}
        fields={[
          { id: "description", label: "Description" },
          { id: "code", label: "Code" },
          { id: "notes", label: "Notes" }
        ]}
        label="Codes"
        onChange={handleSubChange}
        onSave={handleSave}
      />
    </div>
  );
}