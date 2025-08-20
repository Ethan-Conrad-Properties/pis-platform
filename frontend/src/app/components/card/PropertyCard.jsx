import React, { useState, useEffect, useRef } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import SubSection from "./SubSection";
import SuccessModal from "../common/SuccessModal";
import PropertySearch from "../common/PropertySearch";
import axiosInstance from "@/app/utils/axiosInstance";
import {
  formatDate,
  filterBySearch,
  exportProperty,
  sort,
} from "@/app/utils/helpers";
import {
  propertyFields,
  suiteFields,
  serviceFields,
  utilityFields,
  codeFields,
} from "./cardFields";
import Image from "next/image";
import PropertyPhotos from "./PropertyPhotos";
import { useSession } from "next-auth/react";
import { isDirector, isPM, isIT, isBroker } from "@/app/constants/roles";

export default function PropertyCard({ property, onUpdate }) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    ...property,
    suites: property.suites || [],
    services: property.services || [],
    utilities: property.utilities || [],
    codes: property.codes || [],
  });

  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

  // Fetch latest property data
  const { data: propertyData, refetch } = useQuery({
    queryKey: ["property", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(`/properties/${property.yardi}`);
      return res.data;
    },
    enabled: !!property.yardi,
    initialData: property,
  });

  // Keep local form in sync with server data
  useEffect(() => {
    setForm({
      ...propertyData,
      suites: propertyData.suites || [],
      services: propertyData.services || [],
      utilities: propertyData.utilities || [],
      codes: propertyData.codes || [],
    });
  }, [propertyData]);

  // getFields for each section
  const getSuiteFields = (item) => [
    item.suite,
    item.name,
    item.sqft,
    item.hvac,
    item.hvac_info,
    item.notes,
  ];
  const getServiceFields = (item) => [
    item.service_type,
    item.vendor,
    item.paid_by,
    item.notes,
  ];
  const getUtilityFields = (item) => [
    item.service,
    item.vendor,
    item.account_number,
    item.meter_number,
    item.paid_by,
    item.notes,
  ];
  const getCodeFields = (item) => [item.description, item.code, item.notes];

  // Filtered sub-items
  const filteredSuites = filterBySearch(form.suites, getSuiteFields, search);
  const filteredServices = filterBySearch(
    sort(form.services, "service_type"),
    getServiceFields,
    search
  );
  const filteredUtilities = filterBySearch(
    form.utilities,
    getUtilityFields,
    search
  );
  const filteredCodes = filterBySearch(form.codes, getCodeFields, search);

  // Handle property field changes (local state for instant UI)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle suite/service/utility/code field changes (local state for instant UI)
  const handleSubChange = (type, idx, field, value) => {
    setForm((prevForm) => {
      const updated = prevForm[type].map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      );
      return { ...prevForm, [type]: updated };
    });
  };

  // Handle contact changes for suites, services, utilities (local state for instant UI)
  const handleContactChange = async (type, idx, contact, action) => {
    setForm((prevForm) => {
      const updatedItems = prevForm[type].map((item, i) => {
        if (i !== idx) return item;
        let updatedContacts;
        if (action === "add") {
          updatedContacts = [...(item.contacts || []), contact];
        } else if (action === "edit") {
          updatedContacts = (item.contacts || []).map((c) =>
            c.contact_id === contact.contact_id ? contact : c
          );
        } else if (action === "delete") {
          updatedContacts = (item.contacts || []).filter(
            (c) => c.contact_id !== contact.contact_id
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
        await axiosInstance.post(`/contacts`, {
          ...contact,
          [`${parentType}_id`]: parentId,
        });
      } else {
        await axiosInstance.put(`/contacts/${contact.contact_id}`, contact);
      }
    }
  }

  // Mutations for saving property and sub-records
  // TODO: handle errors and success modal showing up improperly (apply to all mutations)
  const propertyMutation = useMutation({
    mutationFn: (updated) =>
      axiosInstance.put(`/properties/${property.yardi}`, updated),
    onSuccess: () => {
      setEditing(false);
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
      if (onUpdate) onUpdate(form);
    },
    onError: (error) =>
      alert("Error updating property", error.response?.data?.message),
  });

  const suiteUpdate = useMutation({
    mutationFn: (suite) =>
      axiosInstance.put(`/suites/${suite.suite_id}`, suite),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error updating suite"),
  });

  const serviceUpdate = useMutation({
    mutationFn: (service) =>
      axiosInstance.put(`/services/${service.service_id}`, service),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error updating service"),
  });

  const utilityUpdate = useMutation({
    mutationFn: (utility) =>
      axiosInstance.put(`/utilities/${utility.utility_id}`, utility),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error updating utility"),
  });

  const codeUpdate = useMutation({
    mutationFn: (code) => axiosInstance.put(`/codes/${code.code_id}`, code),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error updating code"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (newActive) =>
      axiosInstance.put(`/properties/${property.yardi}`, {
        ...form,
        active: newActive,
      }),
    onSuccess: (_, variables) => {
      setForm((f) => ({ ...f, active: variables }));
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
      if (onUpdate) onUpdate({ ...form, active: variables });
    },
    onError: () => alert("Error updating property"),
  });

  // --- Create (POST) mutations ---
  const suiteCreate = useMutation({
    mutationFn: (suite) =>
      axiosInstance.post(`/suites`, {
        ...suite,
        property_yardi: property.yardi,
      }),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error adding suite"),
  });

  const serviceCreate = useMutation({
    mutationFn: (service) =>
      axiosInstance.post(`/services`, {
        ...service,
        property_yardi: property.yardi,
      }),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error adding service"),
  });

  const utilityCreate = useMutation({
    mutationFn: (utility) =>
      axiosInstance.post(`/utilities`, {
        ...utility,
        property_yardi: property.yardi,
      }),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error adding utility"),
  });

  const codeCreate = useMutation({
    mutationFn: (code) =>
      axiosInstance.post(`/codes`, { ...code, property_yardi: property.yardi }),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error adding code"),
  });

  // 2) delete mutations
  const suiteDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/suites/${id}`),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error deleting suite"),
  });
  const serviceDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/services/${id}`),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error deleting service"),
  });
  const utilityDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/utilities/${id}`),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error deleting utility"),
  });
  const codeDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/codes/${id}`),
    onSuccess: () => {
      setShowModal(true);
      refetch();
      queryClient.invalidateQueries(["properties"]);
    },
    onError: () => alert("Error deleting code"),
  });

  const entityMap = {
    suites: {
      idKey: "suite_id",
      fkKey: "property_yardi",
      create: suiteCreate,
      update: suiteUpdate,
      remove: suiteDelete,
      parentType: "suite",
    },
    services: {
      idKey: "service_id",
      fkKey: "property_yardi",
      create: serviceCreate,
      update: serviceUpdate,
      remove: serviceDelete,
      parentType: "service",
    },
    utilities: {
      idKey: "utility_id",
      fkKey: "property_yardi",
      create: utilityCreate,
      update: utilityUpdate,
      remove: utilityDelete,
      parentType: "utility",
    },
    codes: {
      idKey: "code_id",
      fkKey: "property_yardi",
      create: codeCreate,
      update: codeUpdate,
      remove: codeDelete,
      parentType: null,
    },
  };

  async function upsertEntity(section, idx) {
    const cfg = entityMap[section];
    const list = form[section] || [];
    const item = list[idx];
    const id = item?.[cfg.idKey];
    if (!item) return;

    if (!id) {
      // POST
      const { data: created } = await cfg.create.mutateAsync(item);

      setForm((prev) => {
        const next = [...(prev[section] || [])];
        next[idx] = created; // swap temp with server entity
        return { ...prev, [section]: next };
      });

      // save contacts after creation (only for suites/services/utilities)
      if (cfg.parentType && item.contacts?.length) {
        await saveContacts(item.contacts, created[cfg.idKey], cfg.parentType);
      }
    } else {
      // PUT
      await cfg.update.mutateAsync(item);
      if (cfg.parentType && item.contacts?.length) {
        await saveContacts(item.contacts, id, cfg.parentType);
      }
    }
  }

  // Save property and all sub-records
  const handleSave = async (section, idx = null) => {
    try {
      if (section === "property") {
        propertyMutation.mutate(form);
      } else if (idx !== null) {
        await upsertEntity(section, idx);
      }
      setEditing(false);
      if (onUpdate) onUpdate(form);
    } catch (error) {
      alert("Error updating property or related records");
    }
  };

  const handleDelete = async (section, idx) => {
    const list = form[section] || [];
    const item = list[idx];
    if (!item) return;

    const idKey = entityMap[section].idKey;
    const id = item[idKey];

    try {
      // If not persisted yet, just remove locally
      if (!id) {
        setForm((prev) => {
          const next = [...(prev[section] || [])];
          next.splice(idx, 1);
          return { ...prev, [section]: next };
        });
        setShowModal(true); // feedback for local delete
        return;
      }

      // Persisted: call DELETE
      await entityMap[section].remove.mutateAsync(id);

      // Remove from local state
      setForm((prev) => {
        const next = [...(prev[section] || [])];
        next.splice(idx, 1);
        return { ...prev, [section]: next };
      });
    } catch {
      alert("Error deleting item");
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
          value={name === "coe" ? formatDate(form[name]) : form[name] ?? ""}
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

  // handle adding entity
  const handleAdd = (type) => {
    const empty =
      type === "suites"
        ? {
            suite_id: null,
            suite: "",
            sqft: "",
            name: "",
            notes: "",
            hvac: "",
            hvac_info: "",
            commercial_cafe: "",
            door_access_codes: "",
            lease_obligations: "",
            signage_rights: "",
            parking_spaces: "",
            electrical_amperage: "",
            misc: "",
          }
        : type === "services"
        ? {
            service_id: null,
            service_type: "",
            vendor: "",
            notes: "",
            paid_by: "",
          }
        : type === "utilities"
        ? {
            utility_id: null,
            service: "",
            vendor: "",
            account_number: "",
            meter_number: "",
            notes: "",
            paid_by: "",
          }
        : {
            code_id: null,
            description: "",
            code: "",
            notes: "",
          };

    setForm((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), empty],
    }));
  };

  // Scroll to first matching section when search changes and matches found
  useEffect(() => {
    if (!search) return;
    const handler = setTimeout(() => {
      if (filteredSuites.length > 0 && suitesRef.current) {
        suitesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (filteredServices.length > 0 && servicesRef.current) {
        servicesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (filteredUtilities.length > 0 && utilitiesRef.current) {
        utilitiesRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else if (filteredCodes.length > 0 && codesRef.current) {
        codesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [
    search,
    filteredSuites,
    filteredServices,
    filteredUtilities,
    filteredCodes,
  ]);

  return (
    <div className="bg-white rounded shadow-2xl p-4">
      <SuccessModal open={showModal} onClose={handleCloseModal} />
      <div className="flex items-center justify-between text-lg mb-2">
        {renderField("Address", "address")}
        <div className="space-x-2">
          {isDirector(session) && (
            <button
              className="border border-red px-2 py-1 rounded text-red-700 hover:bg-red-100 hover:cursor-pointer"
              onClick={() => toggleActiveMutation.mutate(!propertyData.active)}
              disabled={toggleActiveMutation.isPending}
            >
              {propertyData.active ? "Mark as Sold" : "Mark as Not Sold"}
            </button>
          )}
          {(isDirector(session) ||
            isPM(session) ||
            isIT(session) ||
            isBroker(session)) && (
            <>
              <button
                className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => exportProperty(propertyData)}
              >
                Export
              </button>
              <button
                onClick={() => setEditing((e) => !e)}
                className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
              >
                {editing ? "Cancel" : "Edit"}
              </button>
            </>
          )}
        </div>
      </div>
      <PropertySearch
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search property details..."
      />
      {property.prop_photo && !editing && (
        <Image
          src={property.prop_photo}
          alt="Property"
          width={800}
          height={400}
          className="block mb-2 mx-auto w-full max-w-2xl h-64 object-cover rounded"
        />
      )}

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 space-x-2 text-xs md:text-sm">
        {propertyFields.map((field) => (
          <React.Fragment key={field.name}>
            {renderField(field.label, field.name, field.name)}
          </React.Fragment>
        ))}
      </div>

      {editing && (
        <div className="mt-2">
          <button
            onClick={() => handleSave("property")}
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
          >
            Save
          </button>
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
          onAdd={handleAdd}
          onDelete={handleDelete}
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
          onAdd={handleAdd}
          onDelete={handleDelete}
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
          onAdd={handleAdd}
          onDelete={handleDelete}
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
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      </div>
      <SubSection
        type="photos"
        items={[]}
        fields={[]}
        label="Photos"
        editing={editing}
        renderContent={() => (
          <PropertyPhotos propertyYardi={property.yardi} editing={editing} />
        )}
      />
    </div>
  );
}
