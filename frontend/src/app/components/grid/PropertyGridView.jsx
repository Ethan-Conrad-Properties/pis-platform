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

/**
 * PropertyGridView
 * ----------------
 * Full-page grid-based view for a single property.
 *
 * Features:
 *  - Displays property details (address, manager, type, etc.)
 *  - Search across suites, services, utilities, codes
 *  - Four grid sections (Suites, Services, Utilities, Codes) with:
 *      • Add, update, delete rows (via mutations)
 *      • Row/column persistence handled by PropertyGridSection
 *  - Export property data to Excel
 *  - Director-only action: toggle property active/sold status
 *
 * Props:
 *  - property: object → full property data
 *  - isLoading: bool → loading state
 *  - error: any → error state
 */
export default function PropertyGridView({ property, isLoading, error }) {
  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading property…</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">Error loading property.</div>
    );
  }

  if (!property) {
    return <div className="p-4 text-sm text-gray-500">Property not found.</div>;
  }

  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  // -----------------------------
  // Queries (fetch related data)
  // -----------------------------
  const { data: suites = [], refetch: refetchSuites } = useQuery({
    queryKey: ["suites", property.yardi],
    queryFn: async () =>
      (await axiosInstance.get(`/suites?property_yardi=${property.yardi}`)).data,
    enabled: !!property.yardi,
  });

  const { data: services = [], refetch: refetchServices } = useQuery({
    queryKey: ["services", property.yardi],
    queryFn: async () =>
      (await axiosInstance.get(`/services?property_yardi=${property.yardi}`))
        .data,
    enabled: !!property.yardi,
  });

  const { data: utilities = [], refetch: refetchUtilities } = useQuery({
    queryKey: ["utilities", property.yardi],
    queryFn: async () =>
      (await axiosInstance.get(`/utilities?property_yardi=${property.yardi}`))
        .data,
    enabled: !!property.yardi,
  });

  const { data: codes = [], refetch: refetchCodes } = useQuery({
    queryKey: ["codes", property.yardi],
    queryFn: async () =>
      (await axiosInstance.get(`/codes?property_yardi=${property.yardi}`)).data,
    enabled: !!property.yardi,
  });

  const { data: contacts = [], refetch: refetchContacts } = useQuery({
    queryKey: ["contacts", property.yardi],
    queryFn: async () =>
      (await axiosInstance.get(`/contacts?property_yardi=${property.yardi}`))
        .data,
    enabled: !!property.yardi,
  });

  // -----------------------------
  // Mutations (add/update/delete)
  // -----------------------------
  // Suites
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
  const deleteSuiteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/suites/${id}`),
    onSuccess: () => refetchSuites(),
    onError: () => alert("Error deleting suite"),
  });

  // Services
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
  const deleteServiceMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/services/${id}`),
    onSuccess: () => refetchServices(),
    onError: () => alert("Error deleting service"),
  });

  // Utilities
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
  const deleteUtilityMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/utilities/${id}`),
    onSuccess: () => refetchUtilities(),
    onError: () => alert("Error deleting utility"),
  });

  // Codes
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
  const deleteCodeMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/codes/${id}`),
    onSuccess: () => refetchCodes(),
    onError: () => alert("Error deleting code"),
  });

  // Contacts
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
  const deleteContactMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/contacts/${id}`),
    onSuccess: () => refetchContacts(),
    onError: () => alert("Error deleting contact"),
  });

  // Property active/sold toggle
  const toggleActiveMutation = useMutation({
    mutationFn: (newActive) =>
      axiosInstance.put(`/properties/${property.yardi}`, { active: newActive }),
    onSuccess: () => alert("Property status updated."),
    onError: () => alert("Error updating property"),
  });

  // -----------------------------
  // Filtering helpers
  // -----------------------------
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

  // Apply search filter
  const filteredSuites = filterBySearch(suites, getSuiteFields, search);
  const filteredServices = filterBySearch(services, getServiceFields, search);
  const filteredUtilities = filterBySearch(utilities, getUtilityFields, search);
  const filteredCodes = filterBySearch(codes, getCodeFields, search);

  // -----------------------------
  // Mutation mapping + handlers
  // -----------------------------
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

  // Handles inline cell edits (decides add vs update)
  const onCellValueChanged = useCallback(
    (section, params) => {
      const { add, update, idField } = mutationMap[section];
      const id = params.data[idField];
      id ? update.mutate(params.data) : add.mutate(params.data);
    },
    []
  );

  // Handles deleting selected rows
  const handleDeleteRows = useCallback((section, rows) => {
    const { del, idField } = mutationMap[section];
    const ids = rows.map((r) => r[idField]).filter(Boolean);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} ${section.slice(0, -1)}(s)?`)) return;
    ids.forEach((id) => del.mutate(id));
  }, []);

  // -----------------------------
  // UI: auto-scroll on search
  // -----------------------------
  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

  useEffect(() => {
    if (!search) return;
    const handler = setTimeout(() => {
      if (filteredSuites.length > 0 && suitesRef.current) {
        suitesRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (filteredServices.length > 0 && servicesRef.current) {
        servicesRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (filteredUtilities.length > 0 && utilitiesRef.current) {
        utilitiesRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (filteredCodes.length > 0 && codesRef.current) {
        codesRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, filteredSuites, filteredServices, filteredUtilities, filteredCodes]);

  // Data passed to export function
  const propertyData = { property, suites, services, utilities, codes };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="bg-white px-6 py-10 rounded shadow-xl flex flex-col min-h-screen">
      <h2 className="text-xl md:text-3xl font-bold mb-4 text-center">
        {property.address} {property.city}, {property.state} {property.zip}
      </h2>
      <h3 className="text-md md:text-lg font-normal mb-4 text-center">
        Building Type: {property.building_type} | Property Manager:{" "}
        {property.prop_manager} | Total Sq Ft: {property.total_sq_ft}
      </h3>

      {/* Search + Export + Active toggle */}
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

      {/* Property data grid (read-only) */}
      <PropertyGridSection
        title="Property Data"
        columns={makeColumns(propertyColumns)}
        rows={[property]}
        onAddRow={null}
        onCellValueChanged={() => {}}
      />

      {/* Suites grid */}
      <div ref={suitesRef}>
        <PropertyGridSection
          title="Suites"
          yardi={property.yardi}
          columns={makeColumns(suiteColumns)}
          rows={filteredSuites}
          search={search}
          autoExpand
          onAddRow={() => addSuiteMutation.mutate({ property_yardi: property.yardi })}
          onDeleteRows={(rows) => handleDeleteRows("suites", rows)}
          onCellValueChanged={(params) => onCellValueChanged("suites", params)}
        />
      </div>

      {/* Services grid */}
      <div ref={servicesRef}>
        <PropertyGridSection
          title="Services"
          yardi={property.yardi}
          columns={makeColumns(serviceColumns)}
          rows={filteredServices}
          search={search}
          autoExpand
          onAddRow={() => addServiceMutation.mutate({ property_yardi: property.yardi })}
          onDeleteRows={(rows) => handleDeleteRows("services", rows)}
          onCellValueChanged={(params) => onCellValueChanged("services", params)}
        />
      </div>

      {/* Utilities grid */}
      <div ref={utilitiesRef}>
        <PropertyGridSection
          title="Utilities"
          yardi={property.yardi}
          columns={makeColumns(utilityColumns)}
          rows={filteredUtilities}
          search={search}
          autoExpand
          onAddRow={() => addUtilityMutation.mutate({ property_yardi: property.yardi })}
          onDeleteRows={(rows) => handleDeleteRows("utilities", rows)}
          onCellValueChanged={(params) => onCellValueChanged("utilities", params)}
        />
      </div>

      {/* Codes grid */}
      <div ref={codesRef}>
        <PropertyGridSection
          title="Codes"
          yardi={property.yardi}
          columns={makeColumns(codeColumns)}
          rows={filteredCodes}
          search={search}
          autoExpand
          onAddRow={() => addCodeMutation.mutate({ property_yardi: property.yardi })}
          onDeleteRows={(rows) => handleDeleteRows("codes", rows)}
          onCellValueChanged={(params) => onCellValueChanged("codes", params)}
        />
      </div>
    </div>
  );
}
