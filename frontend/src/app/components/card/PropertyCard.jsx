/**
 * PropertyCard.jsx
 * -----------------
 * Displays a detailed view of a property in a "card" layout.
 * Includes editable property details, suites, services, utilities,
 * codes, and photos. Supports CRUD operations, search, and export.
 *
 * Features:
 *  - Edit mode toggle (inline editing of fields)
 *  - CRUD for suites, services, utilities, codes
 *  - Contact management inside suites/services/utilities
 *  - Local row ordering persistence with localStorage
 *  - Search with auto-scroll to the first matching section
 *  - Export property data to Excel
 *  - Mark property as sold/unsold
 *  - Property photos section with upload support
 */

import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SubSection from "./SubSection";
import SuccessModal from "../common/SuccessModal";
import PropertySearch from "../common/PropertySearch";
import axiosInstance from "@/app/utils/axiosInstance";
import {
  formatDate,
  filterBySearch,
  exportProperty,
  reorderFromStorage,
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
import { isDirector, isPM, isIT, isAP } from "@/app/constants/roles";

export default function PropertyCard({ property, onUpdate }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // State
  const [editing, setEditing] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    ...property,
    suites: property.suites || [],
    services: property.services || [],
    utilities: property.utilities || [],
    codes: property.codes || [],
  });

  // Section refs for smooth scroll on search
  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

  /**
   * Query: fetch full property details from backend.
   * Keeps card in sync with latest data.
   */
  const { data: propertyData, refetch } = useQuery({
    queryKey: ["property", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(`/properties/${property.yardi}`);
      return res.data;
    },
    enabled: !!property.yardi,
    initialData: property,
  });

  // Sync local form state when query data updates
  useEffect(() => {
    if (drafting) return;

    setForm({
      ...propertyData,
      suites: propertyData.suites || [],
      services: propertyData.services || [],
      utilities: propertyData.utilities || [],
      codes: propertyData.codes || [],
    });
  }, [propertyData]);

  const getRowId = ({ data }) =>
    String(
      data.yardi ??
        data.suite_id ??
        data.service_id ??
        data.utility_id ??
        data.code_id
    );

  const alphaSort = (items, keyFn) =>
    [...items].sort((a, b) =>
      (keyFn(a) || "")
        .toLowerCase()
        .localeCompare((keyFn(b) || "").toLowerCase())
    );

  const sortedSuites = drafting
    ? form.suites
    : alphaSort(form.suites, (item) => item.suite);

  const sortedServices = drafting
    ? form.services
    : alphaSort(form.services, (item) => item.service_type);

  const sortedUtilities = drafting
    ? form.utilities
    : alphaSort(form.utilities, (item) => item.service);

  const sortedCodes = drafting
    ? form.codes
    : alphaSort(form.codes, (item) => item.description);

  // Preserve row order from localStorage (Excel/grid ordering takes precedence)
  const orderedSuites = drafting
    ? sortedSuites
    : reorderFromStorage(property.yardi, "Suites", sortedSuites, getRowId);

  const orderedServices = drafting
    ? sortedServices
    : reorderFromStorage(property.yardi, "Services", sortedServices, getRowId);

  const orderedUtilities = drafting
    ? sortedUtilities
    : reorderFromStorage(
        property.yardi,
        "Utilities",
        sortedUtilities,
        getRowId
      );
  const orderedCodes = drafting
    ? sortedCodes
    : reorderFromStorage(property.yardi, "Codes", sortedCodes, getRowId);

  // Search filtering
  const filteredSuites = drafting
    ? form.suites
    : filterBySearch(
        orderedSuites,
        (item) => [
          item.suite,
          item.name,
          item.sqft,
          item.hvac,
          item.hvac_info,
          item.notes,
        ],
        search
      );

  const filteredServices = drafting
    ? form.services
    : filterBySearch(
        orderedServices,
        (item) => [item.service_type, item.vendor, item.paid_by, item.notes],
        search
      );

  const filteredUtilities = drafting
    ? form.utilities
    : filterBySearch(
        orderedUtilities,
        (item) => [
          item.service,
          item.vendor,
          item.account_number,
          item.meter_number,
          item.paid_by,
          item.notes,
        ],
        search
      );

  const filteredCodes = drafting
    ? form.codes
    : filterBySearch(
        orderedCodes,
        (item) => [item.description, item.code, item.notes],
        search
      );

  // Handle property field changes (local state for instant UI)
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle suite/service/utility/code field changes (local state for instant UI)
  const handleSubChange = (type, id, field, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].map((item) => {
        const itemId =
          item.suite_id || item.service_id || item.utility_id || item.code_id;

        return itemId === id ? { ...item, [field]: value } : item;
      }),
    }));
  };

  // Handle contact changes for suites, services, utilities (local state for instant UI)
  const handleContactChange = async (type, idx, contact, action) => {
    setForm((prevForm) => {
      const updatedItems = prevForm[type].map((item, i) => {
        if (i !== idx) return item;
        let updatedContacts;
        if (action === "add") {
          const { contact_id, ...rest } = contact || {};
          updatedContacts = [...(item.contacts || []), rest];
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

  // Mutations for saving property and sub-records
  const propertyMutation = useMutation({
    mutationFn: (updated) =>
      axiosInstance.put(`/properties/${property.yardi}`, updated),
    onMutate: async (updatedProperty) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        ...updatedProperty,
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      }
      alert("Error updating property");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["property", property.yardi]);
      setShowModal(true);
    },
  });

  const suiteCreate = useMutation({
    mutationFn: (suite) =>
      axiosInstance.post(`/suites`, {
        ...suite,
        property_yardi: property.yardi,
      }),
    onMutate: async (newSuite) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        suites: [
          ...(old?.suites || []),
          { ...newSuite, suite_id: "temp-" + Date.now() },
        ],
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error adding suite");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const suiteUpdate = useMutation({
    mutationFn: (suite) =>
      axiosInstance.put(`/suites/${suite.suite_id}`, suite),
    onMutate: async (updatedSuite) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        suites: old.suites.map((s) =>
          s.suite_id === updatedSuite.suite_id ? updatedSuite : s
        ),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error updating suite");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const suiteDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/suites/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        suites: old.suites.filter((s) => s.suite_id !== id),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error deleting suite");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const serviceCreate = useMutation({
    mutationFn: (service) =>
      axiosInstance.post(`/services`, {
        ...service,
        property_yardi: property.yardi,
      }),
    onMutate: async (newService) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        services: [
          ...(old?.services || []),
          { ...newService, service_id: "temp-" + Date.now() },
        ],
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error adding service");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const serviceUpdate = useMutation({
    mutationFn: (service) =>
      axiosInstance.put(`/services/${service.service_id}`, service),
    onMutate: async (updatedService) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        services: old.services.map((s) =>
          s.service_id === updatedService.service_id ? updatedService : s
        ),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error updating service");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const serviceDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/services/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        services: old.services.filter((s) => s.service_id !== id),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error deleting service");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const utilityCreate = useMutation({
    mutationFn: (utility) =>
      axiosInstance.post(`/utilities`, {
        ...utility,
        property_yardi: property.yardi,
      }),
    onMutate: async (newUtility) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        utilities: [
          ...(old?.utilities || []),
          { ...newUtility, utility_id: "temp-" + Date.now() },
        ],
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error adding utility");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const utilityUpdate = useMutation({
    mutationFn: (utility) =>
      axiosInstance.put(`/utilities/${utility.utility_id}`, utility),
    onMutate: async (updatedUtility) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        utilities: old.utilities.map((u) =>
          u.utility_id === updatedUtility.utility_id ? updatedUtility : u
        ),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error updating utility");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const utilityDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/utilities/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        utilities: old.utilities.filter((u) => u.utility_id !== id),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error deleting utility");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const codeCreate = useMutation({
    mutationFn: (code) =>
      axiosInstance.post(`/codes`, { ...code, property_yardi: property.yardi }),
    onMutate: async (newCode) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        codes: [
          ...(old?.codes || []),
          { ...newCode, code_id: "temp-" + Date.now() },
        ],
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error adding code");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const codeUpdate = useMutation({
    mutationFn: (code) => axiosInstance.put(`/codes/${code.code_id}`, code),
    onMutate: async (updatedCode) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        codes: old.codes.map((c) =>
          c.code_id === updatedCode.code_id ? updatedCode : c
        ),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error updating code");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const codeDelete = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/codes/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(["property", property.yardi]);
      const previousData = queryClient.getQueryData([
        "property",
        property.yardi,
      ]);
      queryClient.setQueryData(["property", property.yardi], (old) => ({
        ...old,
        codes: old.codes.filter((c) => c.code_id !== id),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(
          ["property", property.yardi],
          context.previousData
        );
      alert("Error deleting code");
    },
    onSettled: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (active) =>
      axiosInstance.put(`/properties/${property.yardi}`, { active }),
    onSuccess: () =>
      queryClient.invalidateQueries(["property", property.yardi]),
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

  async function upsertEntity(section, id) {
    const cfg = entityMap[section];
    const list = form[section] || [];

    const item = list.find((i) => i[cfg.idKey] === id);
    if (!item) return;

    const isTemp = typeof id === "string" && id.startsWith("temp-");

    // build payload safely
    const payload = { ...item };

    // NEVER send temp IDs to backend
    if (isTemp) {
      delete payload[cfg.idKey];
    }

    // ensure FK is present (defensive)
    if (cfg.fkKey && !payload[cfg.fkKey]) {
      payload[cfg.fkKey] = form.yardi;
    }

    // CREATE
    if (isTemp) {
      const { data: created } = await cfg.create.mutateAsync(payload);

      setForm((prev) => ({
        ...prev,
        [section]: prev[section].map((i) =>
          i[cfg.idKey] === id ? created : i
        ),
      }));

      return;
    }

    // ✏️ UPDATE
    await cfg.update.mutateAsync({
      ...payload,
      [cfg.idKey]: id, // explicit ID for updates
    });
  }

  // Save property and all sub-records
  const handleSave = async (section, id = null) => {
    try {
      if (section === "property") {
        propertyMutation.mutate(form);
      } else if (id !== null) {
        await upsertEntity(section, id);
      }
      setEditing(false);
      setDrafting(false);
      if (onUpdate) onUpdate(form);
    } catch (error) {
      alert("Error updating property or related records");
    }
  };

  // handle adding entity
  const handleAdd = (type, tempId) => {
    setDrafting(true);
    const empty =
      type === "suites"
        ? {
            suite_id: tempId,
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
            service_id: tempId,
            service_type: "",
            vendor: "",
            notes: "",
            paid_by: "",
            tenant_specifics: "",
            suite_specifics: "",
          }
        : type === "utilities"
        ? {
            utility_id: tempId,
            service: "",
            vendor: "",
            account_number: "",
            meter_number: "",
            notes: "",
            paid_by: "",
          }
        : {
            code_id: tempId,
            description: "",
            code: "",
            notes: "",
          };

    setForm((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), empty],
    }));
  };

  const handleDelete = async (section, id) => {
    if (typeof id === "string" && id.startsWith("temp-")) {
      setForm((prev) => ({
        ...prev,
        [section]: prev[section].filter((i) => {
          const itemId =
            i.suite_id || i.service_id || i.utility_id || i.code_id;
          return itemId !== id;
        }),
      }));
      return;
    }

    // real delete
    await entityMap[section].remove.mutateAsync(id);
  };

  const handleCancel = () => {
    setForm({
      ...propertyData,
      suites: propertyData.suites || [],
      services: propertyData.services || [],
      utilities: propertyData.utilities || [],
      codes: propertyData.codes || [],
    });
    setEditing(false);
    setDrafting(false);
  };

  const handleCloseModal = () => setShowModal(false);

  /**
   * Field renderer (edit vs. view mode)
   */
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
        <span
          className="break-all inline-block align-bottom"
          dangerouslySetInnerHTML={{
            __html:
              name === "coe"
                ? formatDate(property[name])
                : property[name] || "",
          }}
        />
      )}
    </div>
  );

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

  /**
   * Render
   */
  return (
    <div
      className="bg-white rounded shadow-2xl p-4 "
      style={{
        background: "var(--surface)",
        color: "var(--surface-foreground)",
      }}
    >
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
            isAP(session)) && (
            <>
              <button
                className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => exportProperty(propertyData)}
              >
                Export
              </button>
              <button
                onClick={() => {
                  if (editing) {
                    handleCancel();
                  } else {
                    setEditing(true);
                  }
                }}
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
        onAdd={() => {}}
      />
    </div>
  );
}
