// PropertyGridView.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import PropertyGridSection from "./PropertyGridSection";
import { makeColumns } from "./makeColumns";
import {
  propertyColumns,
  suiteColumns,
  serviceColumns,
  utilityColumns,
  codeColumns,
} from "./GridColumns";
import axiosInstance from "@/app/utils/axiosInstance";
import { filterBySearch, exportProperty } from "@/app/utils/helpers";
import PropertySearch from "../common/PropertySearch";
import { useSession } from "next-auth/react";
import { isDirector } from "@/app/constants/roles";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PropertyGridView({ property }) {
  if (!property) {
    return <div className="p-4 text-sm text-gray-500">Loading property…</div>;
  }

  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  // Suites
  const { data: suites = [], refetch: refetchSuites } = useQuery({
    queryKey: ["suites", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/suites?property_yardi=${property.yardi}`
      );
      return res.data;
    },
    enabled: !!property.yardi,
  });

  // Services
  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ["services", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/services?property_yardi=${property.yardi}`
      );
      return res.data;
    },
    enabled: !!property.yardi,
  });

  // Utilities
  const { data: utilities = [], refetch: refetchUtilities } = useQuery({
    queryKey: ["utilities", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/utilities?property_yardi=${property.yardi}`
      );
      return res.data;
    },
    enabled: !!property.yardi,
  });

  // Codes
  const { data: codes = [], refetch: refetchCodes } = useQuery({
    queryKey: ["codes", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/codes?property_yardi=${property.yardi}`
      );
      return res.data;
    },
    enabled: !!property.yardi,
  });

  // Contacts
  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ["contacts", property.yardi],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/contacts?property_yardi=${property.yardi}`
      );
      return res.data;
    },
    enabled: !!property.yardi,
  });

  // ---- Mutations: add/update ----
  const addSuiteMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/suites", payload),
    onSuccess: () => refetchSuites(),
    onError: () => alert("Error adding suite"),
  });
  const updateSuiteMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/suites/${payload.suite_id}`, payload),
    onSuccess: () => refetchSuites(),
    onError: () => alert("Error updating suite"),
  });

  const addServiceMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/services", payload),
    onSuccess: () => refetchServices(),
    onError: () => alert("Error adding service"),
  });
  const updateServiceMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/services/${payload.service_id}`, payload),
    onSuccess: () => refetchServices(),
    onError: () => alert("Error updating service"),
  });

  const addUtilityMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/utilities", payload),
    onSuccess: () => refetchUtilities(),
    onError: () => alert("Error adding utility"),
  });
  const updateUtilityMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/utilities/${payload.utility_id}`, payload),
    onSuccess: () => refetchUtilities(),
    onError: () => alert("Error updating utility"),
  });

  const addCodeMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/codes", payload),
    onSuccess: () => refetchCodes(),
    onError: () => alert("Error adding code"),
  });
  const updateCodeMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/codes/${payload.code_id}`, payload),
    onSuccess: () => refetchCodes(),
    onError: () => alert("Error updating code"),
  });

  const addContactMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/contacts", payload),
    onSuccess: () => refetchContacts(),
    onError: () => alert("Error adding contact"),
  });

  const updateContactMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/contacts/${payload.contact_id}`, payload),
    onSuccess: () => refetchContacts(),
    onError: () => alert("Error updating contact"),
  });

  // ---- delete mutations ----
  const deleteSuiteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/suites/${id}`),
    onSuccess: () => refetchSuites(),
    onError: () => alert("Error deleting suite"),
  });
  const deleteServiceMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/services/${id}`),
    onSuccess: () => refetchServices(),
    onError: () => alert("Error deleting service"),
  });
  const deleteUtilityMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/utilities/${id}`),
    onSuccess: () => refetchUtilities(),
    onError: () => alert("Error deleting utility"),
  });
  const deleteCodeMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/codes/${id}`),
    onSuccess: () => refetchCodes(),
    onError: () => alert("Error deleting code"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (newActive) =>
      axiosInstance.put(`/properties/${property.yardi}`, { active: newActive }),
    onSuccess: () => {
      alert("Property status updated.");
    },
    onError: () => alert("Error updating property"),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/contacts/${id}`),
    onSuccess: () => refetchContacts(),
    onError: () => alert("Error deleting contact"),
  });

  // Section refs
  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

  // getFields for filter
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

  // Filtered rows
  const filteredSuites = filterBySearch(suites, getSuiteFields, search);
  const filteredServices = filterBySearch(services, getServiceFields, search);
  const filteredUtilities = filterBySearch(utilities, getUtilityFields, search);
  const filteredCodes = filterBySearch(codes, getCodeFields, search);

  const handleAddRow = (type) => {
    const emptyRow = { property_yardi: property.yardi };
    switch (type) {
      case "suites":
        addSuiteMutation.mutate(emptyRow);
        break;
      case "services":
        addServiceMutation.mutate(emptyRow);
        break;
      case "utilities":
        addUtilityMutation.mutate(emptyRow);
        break;
      case "codes":
        addCodeMutation.mutate(emptyRow);
        break;
      default:
        return;
    }
  };

  const mainColumns = makeColumns(propertyColumns);
  const agSuiteColumns = makeColumns(suiteColumns);
  const agServiceColumns = makeColumns(serviceColumns);
  const agUtilityColumns = makeColumns(utilityColumns);
  const agCodeColumns = makeColumns(codeColumns);

  const mutationMap = {
    suites: {
      add: addSuiteMutation,
      update: updateSuiteMutation,
      del: deleteSuiteMutation,
      idField: "suite_id",
    },
    services: {
      add: addServiceMutation,
      update: updateServiceMutation,
      del: deleteServiceMutation,
      idField: "service_id",
    },
    utilities: {
      add: addUtilityMutation,
      update: updateUtilityMutation,
      del: deleteUtilityMutation,
      idField: "utility_id",
    },
    codes: {
      add: addCodeMutation,
      update: updateCodeMutation,
      del: deleteCodeMutation,
      idField: "code_id",
    },
    contacts: {
      add: addContactMutation,
      update: updateContactMutation,
      del: deleteContactMutation,
      idField: "contact_id",
    },
  };

  const onCellValueChanged = useCallback(
    (section, params) => {
      const { add, update, idField } = mutationMap[section];
      const id = params.data[idField];
      id ? update.mutate(params.data) : add.mutate(params.data);
    },
    [
      addSuiteMutation,
      updateSuiteMutation,
      addServiceMutation,
      updateServiceMutation,
      addUtilityMutation,
      updateUtilityMutation,
      addCodeMutation,
      updateCodeMutation,
    ]
  );

  // ---- shared delete handler ----
  const handleDeleteRows = useCallback((section, rows) => {
    const { del, idField } = mutationMap[section];
    const ids = rows.map((r) => r[idField]).filter(Boolean);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} ${section.slice(0, -1)}(s)?`)) return;
    ids.forEach((id) => del.mutate(id));
  }, []);

  // Scroll to first matching section when searching
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
    }, 400);
    return () => clearTimeout(handler);
  }, [
    search,
    filteredSuites,
    filteredServices,
    filteredUtilities,
    filteredCodes,
  ]);

  // debugging
  useEffect(() => {
    console.log("property.yardi", property.yardi);
    console.log("suites", suites);
    console.log("services", services);
    console.log("utilities", utilities);
    console.log("codes", codes);
  }, [property.yardi, suites, services, utilities, codes]);

  // Ensure export has data available
  const propertyData = { property, suites, services, utilities, codes };

  return (
    <div className="bg-white px-6 py-10 rounded shadow-xl flex flex-col min-h-screen">
      <h2 className="text-xl md:text-3xl font-bold mb-4 text-center">
        {property.address} {property.city}, {property.state} {property.zip}
      </h2>
      <h3 className="text-md md:text-lg font-normal mb-4 text-center">
        Building Type: {property.building_type} | Property Manager:{" "}
        {property.prop_manager} | Total Sq Ft: {property.total_sq_ft}
      </h3>

      <div className="flex items-center justify-between text-lg mb-2">
        <PropertySearch
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search property details..."
        />
        <div className="space-x-2">
          {isDirector(session) && (
            <button
              className="border border-red px-2 py-1 rounded text-red-700 hover:bg-red-100 hover:cursor-pointer"
              onClick={() => toggleActiveMutation.mutate(!property.active)}
              disabled={toggleActiveMutation.isPending}
              type="button"
            >
              {property.active ? "Mark as Sold" : "Mark as Not Sold"}
            </button>
          )}
          <button
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => exportProperty(propertyData)}
          >
            Export
          </button>
        </div>
      </div>

      <PropertyGridSection
        title="Property Data"
        columns={mainColumns}
        rows={[property]}
        onAddRow={null}
        onCellValueChanged={() => {}}
      />

      <div ref={suitesRef}>
        <PropertyGridSection
          title="Suites"
          columns={agSuiteColumns}
          rows={filteredSuites}
          search={search}
          autoExpand
          onAddRow={() => handleAddRow("suites")}
          onDeleteRows={(rows) => handleDeleteRows("suites", rows)}
          onCellValueChanged={(params) => onCellValueChanged("suites", params)}
        />
      </div>

      <div ref={servicesRef}>
        <PropertyGridSection
          title="Services"
          columns={agServiceColumns}
          rows={filteredServices}
          search={search}
          autoExpand
          onAddRow={() => handleAddRow("services")}
          onDeleteRows={(rows) => handleDeleteRows("services", rows)}
          onCellValueChanged={(params) =>
            onCellValueChanged("services", params)
          }
        />
      </div>

      <div ref={utilitiesRef}>
        <PropertyGridSection
          title="Utilities"
          columns={agUtilityColumns}
          rows={filteredUtilities}
          search={search}
          autoExpand
          onAddRow={() => handleAddRow("utilities")}
          onDeleteRows={(rows) => handleDeleteRows("utilities", rows)}
          onCellValueChanged={(params) =>
            onCellValueChanged("utilities", params)
          }
        />
      </div>

      <div ref={codesRef}>
        <PropertyGridSection
          title="Codes"
          columns={agCodeColumns}
          rows={filteredCodes}
          search={search}
          autoExpand
          onAddRow={() => handleAddRow("codes")}
          onDeleteRows={(rows) => handleDeleteRows("codes", rows)}
          onCellValueChanged={(params) => onCellValueChanged("codes", params)}
        />
      </div>
    </div>
  );
}
