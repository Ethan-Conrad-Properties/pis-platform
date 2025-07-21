import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import PropertyGridSection from './PropertyGridSection';
import { makeColumns } from './makeColumns';
import {
  propertyColumns,
  suiteColumns,
  serviceColumns,
  utilityColumns,
  codeColumns
} from './GridColumns';
import axiosInstance from '@/app/utils/axiosInstance';
import { chunkArray, filterBySearch } from '@/app/utils/helpers';
import PropertySearch from '../common/PropertySearch';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PropertyGridView({ property }) {
  const [suites, setSuites] = useState(property.suites || []);
  const [services, setServices] = useState(property.services || []);
  const [utilities, setUtilities] = useState(property.utilities || []);
  const [codes, setCodes] = useState(property.codes || []);
  const [search, setSearch] = useState('');

  // Section refs
  const suitesRef = useRef(null);
  const servicesRef = useRef(null);
  const utilitiesRef = useRef(null);
  const codesRef = useRef(null);

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

  // Filtered rows
  const filteredSuites = filterBySearch(suites, getSuiteFields, search);
  const filteredServices = filterBySearch(services, getServiceFields, search);
  const filteredUtilities = filterBySearch(utilities, getUtilityFields, search);
  const filteredCodes = filterBySearch(codes, getCodeFields, search);

  // Fetch functions for each section
  const fetchSuites = useCallback(async () => {
    const res = await axiosInstance.get(`/suites?property_id=${property.yardi}`);
    setSuites(res.data);
  }, [property.yardi]);

  const fetchServices = useCallback(async () => {
    const res = await axiosInstance.get(`/services?property_id=${property.yardi}`);
    setServices(res.data);
  }, [property.yardi]);

  const fetchUtilities = useCallback(async () => {
    const res = await axiosInstance.get(`/utilities?property_id=${property.yardi}`);
    setUtilities(res.data);
  }, [property.yardi]);

  const fetchCodes = useCallback(async () => {
    const res = await axiosInstance.get(`/codes?property_id=${property.yardi}`);
    setCodes(res.data);
  }, [property.yardi]);

  // Fetch all data on mount or when property changes
  useEffect(() => {
    fetchSuites();
    fetchServices();
    fetchUtilities();
    fetchCodes();
  }, [fetchSuites, fetchServices, fetchUtilities, fetchCodes]);

  const handleAddRow = (type) => {
    const emptyRow = { property_yardi: property.yardi };
    let setRows;
    switch (type) {
      case "suites": setRows = setSuites; break;
      case "services": setRows = setServices; break;
      case "utilities": setRows = setUtilities; break;
      case "codes": setRows = setCodes; break;
      default: return;
    }
    setRows(prev => [...prev, emptyRow]);
  };

  const mainColumns = makeColumns(propertyColumns);
  const columnGroups = chunkArray(mainColumns, 8);
  const agSuiteColumns = makeColumns(suiteColumns);
  const agServiceColumns = makeColumns(serviceColumns);
  const agUtilityColumns = makeColumns(utilityColumns);
  const agCodeColumns = makeColumns(codeColumns);

  const onCellValueChanged = useCallback(async params => {
    try {
      let section = "", idField = "", endpoint = "", id = "";
      if (params.api.getColumnDefs().some(col => col.field === "suite")) {
        section = "suites"; idField = "suite_id"; endpoint = "suites"; id = params.data[idField];
      } else if (params.api.getColumnDefs().some(col => col.field === "service_type")) {
        section = "services"; idField = "service_id"; endpoint = "services"; id = params.data[idField];
      } else if (params.api.getColumnDefs().some(col => col.field === "service")) {
        section = "utilities"; idField = "utility_id"; endpoint = "utilities"; id = params.data[idField];
      } else if (params.api.getColumnDefs().some(col => col.field === "code")) {
        section = "codes"; idField = "code_id"; endpoint = "codes"; id = params.data[idField];
      } else {
        section = "property"; endpoint = "properties"; id = params.data.yardi;
      }
      if (id) {
        await axiosInstance.put(`/${endpoint}/${id}`, params.data);
        console.log(`Saved ${section} row`, params.data);
      } else if (endpoint !== "properties") {
        await axiosInstance.post(`/${endpoint}`, params.data);
      }
      // Refetch the relevant section
      if (section === "suites") fetchSuites();
      if (section === "services") fetchServices();
      if (section === "utilities") fetchUtilities();
      if (section === "codes") fetchCodes();
    } catch (error) {
      alert("Error updating property or related records");
      console.error(error);
    }
  }, [fetchSuites, fetchServices, fetchUtilities, fetchCodes]);

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
    <div className="bg-white px-6 py-10 rounded shadow-xl min-h-screen">
      <h2 className="text-xl md:text-3xl font-bold mb-4 text-center">
        {property.address} {property.city}, {property.state} {property.zip}
      </h2>
      <h3 className="text-md md:text-lg font-normal mb-4 text-center">
        Building Type: {property.building_type} | Property Manager: {property.prop_manager} | Total Sq Ft: {property.total_sq_ft}
      </h3>
      <PropertySearch
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search property details..."
      />
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
          onCellValueChanged={onCellValueChanged}
        />
      </div>
      <div ref={servicesRef}>
        <PropertyGridSection
          title="Services"
          columns={agServiceColumns}
          rows={filteredServices}
          onAddRow={() => handleAddRow("services")}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
      <div ref={utilitiesRef}>
        <PropertyGridSection
          title="Utilities"
          columns={agUtilityColumns}
          rows={filteredUtilities}
          onAddRow={() => handleAddRow("utilities")}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
      <div ref={codesRef}>
        <PropertyGridSection
          title="Codes"
          columns={agCodeColumns}
          rows={filteredCodes}
          onAddRow={() => handleAddRow("codes")}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </div>
  );
}