import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import SubSection from './SubSection';
import SuccessModal from '../common/SuccessModal';
import PropertySearch from '../common/PropertySearch';
import axiosInstance from '@/app/utils/axiosInstance';
import { formatDate, filterBySearch } from '@/app/utils/helpers';
import {
  propertyFields,
  suiteFields,
  serviceFields,
  utilityFields,
  codeFields
} from './cardFields';

export default function PropertyCard({ property, onUpdate }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    ...property,
    suites: property.suites || [],
    services: property.services || [],
    utilities: property.utilities || [],
    codes: property.codes || []
  });

  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

  // Fetch latest property data
  const { data: propertyData, refetch } = useQuery({
    queryKey: ['property', property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(`/properties/${property.yardi}`);
      return res.data;
    },
    enabled: !!property.yardi,
    initialData: property
  });

  // Keep local form in sync with server data
  useEffect(() => {
    setForm({
      ...propertyData,
      suites: propertyData.suites || [],
      services: propertyData.services || [],
      utilities: propertyData.utilities || [],
      codes: propertyData.codes || []
    });
  }, [propertyData]);

  // getFields for each section
  const getSuiteFields = item => [
    item.suite, item.name, item.sqft, item.contact, item.email_address, item.notes
  ];
  const getServiceFields = item => [
    item.service_type, item.vendor, item.contact, item.email_address, item.notes
  ];
  const getUtilityFields = item => [
    item.service, item.vendor, item.contact_info, item.notes
  ];
  const getCodeFields = item => [
    item.description, item.code, item.notes
  ];

  // Filtered sub-items
  const filteredSuites = filterBySearch(form.suites, getSuiteFields, search);
  const filteredServices = filterBySearch(form.services, getServiceFields, search);
  const filteredUtilities = filterBySearch(form.utilities, getUtilityFields, search);
  const filteredCodes = filterBySearch(form.codes, getCodeFields, search);

  // Handle property field changes (local state for instant UI)
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle suite/service/utility/code field changes (local state for instant UI)
  const handleSubChange = (type, idx, field, value) => {
    setForm(prevForm => {
      const updated = prevForm[type].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      return { ...prevForm, [type]: updated };
    });
  };

  // Handle contact changes for suites, services, utilities (local state for instant UI)
  const handleContactChange = async (type, idx, contact, action) => {
    setForm(prevForm => {
      const updatedItems = prevForm[type].map((item, i) => {
        if (i !== idx) return item;
        let updatedContacts;
        if (action === "add") {
          updatedContacts = [...(item.contacts || []), contact];
        } else if (action === "edit") {
          updatedContacts = (item.contacts || []).map(c =>
            c.contact_id === contact.contact_id ? contact : c
          );
        } else if (action === "delete") {
          updatedContacts = (item.contacts || []).filter(c =>
            c.contact_id !== contact.contact_id
          );
        }
        return { ...item, contacts: updatedContacts };
      });
      return { ...prevForm, [type]: updatedItems };
    });
  };

  // Save contacts
  async function saveContacts(contacts, parentId, parentType) {
    for (const contact of contacts) {
      if (!contact.contact_id) {
        await axiosInstance.post(`/contacts`, { ...contact, [`${parentType}_id`]: parentId });
      } else {
        await axiosInstance.put(`/contacts/${contact.contact_id}`, contact);
      }
    }
  }

  // Mutations for saving property and sub-records
  const propertyMutation = useMutation({
    mutationFn: updated => axiosInstance.put(`/properties/${property.yardi}`, updated),
    onSuccess: () => {
      setEditing(false);
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(['properties']);
      if (onUpdate) onUpdate(form);
    },
    onError: () => alert('Error updating property')
  });

  const suiteMutation = useMutation({
    mutationFn: suite => axiosInstance.put(`/suites/${suite.suite_id}`, suite),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(['properties']);
    },
    onError: () => alert('Error updating suite')
  });

  const serviceMutation = useMutation({
    mutationFn: service => axiosInstance.put(`/services/${service.service_id}`, service),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(['properties']);
    },
    onError: () => alert('Error updating service')
  });

  const utilityMutation = useMutation({
    mutationFn: utility => axiosInstance.put(`/utilities/${utility.utility_id}`, utility),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(['properties']);
    },
    onError: () => alert('Error updating utility')
  });

  const codeMutation = useMutation({
    mutationFn: code => axiosInstance.put(`/codes/${code.code_id}`, code),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(['properties']);
    },
    onError: () => alert('Error updating code')
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (newActive) =>
      axiosInstance.put(`/properties/${property.yardi}`, { ...form, active: newActive }),
    onSuccess: (_, variables) => {
      setForm(f => ({ ...f, active: variables }));
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(['properties']);
      if (onUpdate) onUpdate({ ...form, active: variables });
    },
    onError: () => alert('Error updating property')
  });

  // Save property and all sub-records
  const handleSave = async (section, idx = null) => {
    try {
      if (section === "property") {
        propertyMutation.mutate(form);
      } else if (section === "suites" && idx !== null) {
        const suite = form.suites[idx];
        suiteMutation.mutate(suite);
        if (suite.contacts && suite.contacts.length > 0) {
          await saveContacts(suite.contacts, suite.suite_id, "suite");
        }
      } else if (section === "services" && idx !== null) {
        const service = form.services[idx];
        serviceMutation.mutate(service);
        if (service.contacts && service.contacts.length > 0) {
          await saveContacts(service.contacts, service.service_id, "service");
        }
      } else if (section === "utilities" && idx !== null) {
        const utility = form.utilities[idx];
        utilityMutation.mutate(utility);
        if (utility.contacts && utility.contacts.length > 0) {
          await saveContacts(utility.contacts, utility.utility_id, "utility");
        }
      } else if (section === "codes" && idx !== null) {
        const code = form.codes[idx];
        codeMutation.mutate(code);
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

  // Scroll to first matching section when search changes and matches found
  useEffect(() => {
    if (!search) return;
    const handler = setTimeout(() => {
      if (filteredSuites.length > 0 && suitesRef.current) {
        suitesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (filteredServices.length > 0 && servicesRef.current) {
        servicesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (filteredUtilities.length > 0 && utilitiesRef.current) {
        utilitiesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (filteredCodes.length > 0 && codesRef.current) {
        codesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [search, filteredSuites, filteredServices, filteredUtilities, filteredCodes]);

  return (
    <div className="bg-white rounded shadow-2xl p-4">
			<SuccessModal open={showModal} onClose={handleCloseModal} />
      <div className="flex items-center justify-between text-lg mb-2">
        {renderField("Address", "address")}
        <div className="space-x-2">
          <button
            className="border border-red px-2 py-1 rounded text-red-700 hover:bg-red-100 hover:cursor-pointer"
            onClick={() => toggleActiveMutation.mutate(!property.active)}
          >
            {property.active ? "Mark as Sold" : "Mark as Not Sold"}
          </button>
          <button
            onClick={() => setEditing(e => !e)}
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>
      <PropertySearch
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search property details..."
      />
      {property.prop_photo && !editing && (
        <img 
					src={property.prop_photo} alt="Property" 
					className="block mb-2 mx-auto w-full max-w-2xl h-64 object-cover rounded"
 				/>
      )}
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 space-x-2 text-xs md:text-sm">
        {propertyFields.map(field => renderField(field.label, field.name, field.name))}
      </div>

      {editing && (
        <div className="mt-2">
          <button onClick={() => handleSave("property")} className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer">Save</button>
        </div>
      )}

      {/* Suites */}
      <div ref={suitesRef}>
        <SubSection
          type="suites"
          items={filteredSuites}
          fields={suiteFields}
          label="Suites"
          onChange={handleSubChange}
          onSave={handleSave}
          search={search}
          onContactChange={handleContactChange}
        />
      </div>
      {/* Services */}
      <div ref={servicesRef}>
        <SubSection
          type="services"
          items={filteredServices}
          fields={serviceFields}
          label="Services"
          onChange={handleSubChange}
          onSave={handleSave}
          search={search}
          onContactChange={handleContactChange}
        />
      </div>
      {/* Utilities */}
      <div ref={utilitiesRef}>
        <SubSection
          type="utilities"
          items={filteredUtilities}
          fields={utilityFields}
          label="Utilities"
          onChange={handleSubChange}
          onSave={handleSave}
          search={search}
          onContactChange={handleContactChange}
        />
      </div>
      {/* Codes */}
      <div ref={codesRef}>
        <SubSection
          type="codes"
          items={filteredCodes}
          fields={codeFields}
          label="Codes"
          onChange={handleSubChange}
          onSave={handleSave}
          search={search}
        />
      </div>
    </div>
  );
}