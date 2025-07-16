import React, { useState, useEffect, useCallback } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import PropertyGridSection from "./PropertyGridSection";
import { makeAgColumns } from "./makeAgColumns";
import {
  columns,
  suiteColumns,
  serviceColumns,
  utilityColumns,
  codeColumns
} from "./GridColumns";
import axiosInstance from '../utils/axiosInstance';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PropertyGridView({ property }) {
  const [suites, setSuites] = useState(property.suites || []);
  const [services, setServices] = useState(property.services || []);
  const [utilities, setUtilities] = useState(property.utilities || []);
  const [codes, setCodes] = useState(property.codes || []);

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

  function chunkArray(array, size) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
  }

  const agColumns = makeAgColumns(columns);
  const columnGroups = chunkArray(agColumns, 8);
  const agSuiteColumns = makeAgColumns(suiteColumns);
  const agServiceColumns = makeAgColumns(serviceColumns);
  const agUtilityColumns = makeAgColumns(utilityColumns);
  const agCodeColumns = makeAgColumns(codeColumns);

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

  return (
    <div className="bg-white px-6 py-10 rounded shadow-xl min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-center">
        {property.address} {property.city}, {property.state} {property.zip}
      </h2>
      <h3 className="text--lg font-normal mb-4 text-center">
        Building Type: {property.building_type} | Property Manager: {property.prop_manager} | Total Sq Ft: {property.total_sq_ft}
      </h3>
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
      <PropertyGridSection
        title="Suites"
        columns={agSuiteColumns}
        rows={suites}
        onAddRow={() => handleAddRow("suites")}
        onCellValueChanged={onCellValueChanged}
      />
      <PropertyGridSection
        title="Services"
        columns={agServiceColumns}
        rows={services}
        onAddRow={() => handleAddRow("services")}
        onCellValueChanged={onCellValueChanged}
      />
      <PropertyGridSection
        title="Utilities"
        columns={agUtilityColumns}
        rows={utilities}
        onAddRow={() => handleAddRow("utilities")}
        onCellValueChanged={onCellValueChanged}
      />
      <PropertyGridSection
        title="Codes"
        columns={agCodeColumns}
        rows={codes}
        onAddRow={() => handleAddRow("codes")}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
}