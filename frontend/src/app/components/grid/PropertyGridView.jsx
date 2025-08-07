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
import { chunkArray, filterBySearch, exportProperty } from "@/app/utils/helpers";
import PropertySearch from "../common/PropertySearch";
import { useSession } from "next-auth/react";
import { isDirector } from "@/app/constants/roles";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PropertyGridView({ property }) {
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

  // Mutations for add/update
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

  // Section refs
  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

  // getFields for each section
  const getSuiteFields = (item) => [
    item.suite,
    item.name,
    item.sqft,
    item.contact,
    item.email_address,
    item.notes,
  ];
  const getServiceFields = (item) => [
    item.service_type,
    item.vendor,
    item.contact,
    item.email_address,
    item.notes,
  ];
  const getUtilityFields = (item) => [
    item.service,
    item.vendor,
    item.contact_info,
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
  const columnGroups = chunkArray(mainColumns, 8);
  const agSuiteColumns = makeColumns(suiteColumns);
  const agServiceColumns = makeColumns(serviceColumns);
  const agUtilityColumns = makeColumns(utilityColumns);
  const agCodeColumns = makeColumns(codeColumns);

  const mutationMap = {
    suites: {
      add: addSuiteMutation,
      update: updateSuiteMutation,
      idField: "suite_id",
    },
    services: {
      add: addServiceMutation,
      update: updateServiceMutation,
      idField: "service_id",
    },
    utilities: {
      add: addUtilityMutation,
      update: updateUtilityMutation,
      idField: "utility_id",
    },
    codes: {
      add: addCodeMutation,
      update: updateCodeMutation,
      idField: "code_id",
    },
  };

  const onCellValueChanged = useCallback(
    (section, params) => {
      const { add, update, idField } = mutationMap[section];
      const id = params.data[idField];
      if (id) {
        update.mutate(params.data);
      } else {
        add.mutate(params.data);
      }
    },
    [addSuiteMutation, updateSuiteMutation, addServiceMutation, updateServiceMutation, addUtilityMutation, updateUtilityMutation, addCodeMutation, updateCodeMutation]
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

  // debugging
  useEffect(() => {
    console.log("property.yardi", property.yardi);
    console.log("suites", suites);
    console.log("services", services);
    console.log("utilities", utilities);
    console.log("codes", codes);
  }, [property.yardi, suites, services, utilities, codes]);

  return (
    <div className="bg-white px-6 py-10 rounded shadow-xl min-h-screen">
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

      {columnGroups.map((group, idx) => (
        <PropertyGridSection
          key={idx}
          title={idx === 0 ? "Property Data" : ""}
          columns={group}
          rows={[property]}
          onAddRow={null}
          onCellValueChanged={onCellValueChanged}
        />
      ))}
      <div ref={suitesRef}>
        <PropertyGridSection
          title="Suites"
          columns={agSuiteColumns}
          rows={filteredSuites}
          onAddRow={() => handleAddRow("suites")}
          onCellValueChanged={(params) => onCellValueChanged("suites", params)}
        />
      </div>
      <div ref={servicesRef}>
        <PropertyGridSection
          title="Services"
          columns={agServiceColumns}
          rows={filteredServices}
          onAddRow={() => handleAddRow("services")}
          onCellValueChanged={(params) => onCellValueChanged("services", params)}
        />
      </div>
      <div ref={utilitiesRef}>
        <PropertyGridSection
          title="Utilities"
          columns={agUtilityColumns}
          rows={filteredUtilities}
          onAddRow={() => handleAddRow("utilities")}
          onCellValueChanged={(params) => onCellValueChanged("utilities", params)}
        />
      </div>
      <div ref={codesRef}>
        <PropertyGridSection
          title="Codes"
          columns={agCodeColumns}
          rows={filteredCodes}
          onAddRow={() => handleAddRow("codes")}
          onCellValueChanged={(params) => onCellValueChanged("codes", params)}
        />
      </div>
    </div>
  );
}
