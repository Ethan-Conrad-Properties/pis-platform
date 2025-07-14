import React from "react";
import PropertyCard from "./PropertyCard";

export default function PropertyList({
  properties,
  editingYardi,
  setEditingYardi,
  setProperties,
  searchLower
}) {
  return properties.map(property => {
    const isEditing = editingYardi === property.yardi;
    const filteredSuites = !isEditing && searchLower
      ? property.suites?.filter(suite =>
          String(suite.name || '').toLowerCase().includes(searchLower)
        ) || []
      : property.suites;
    const filteredServices = !isEditing && searchLower
      ? property.services?.filter(service =>
          String(service.vendor || '').toLowerCase().includes(searchLower)
        ) || []
      : property.services;
    const filteredUtilities = !isEditing && searchLower
      ? property.utilities?.filter(util =>
          String(util.vendor || '').toLowerCase().includes(searchLower)
        ) || []
      : property.utilities;
    const filteredCodes = !isEditing && searchLower
      ? property.codes?.filter(code =>
          String(code.description || '').toLowerCase().includes(searchLower)
        ) || []
      : property.codes;

    return (
      <PropertyCard
        key={property.yardi}
        property={{
          ...property,
          suites: filteredSuites,
          services: filteredServices,
          utilities: filteredUtilities,
          codes: filteredCodes,
        }}
        editing={isEditing}
        onEdit={() => setEditingYardi(property.yardi)}
        onCancelEdit={() => setEditingYardi(null)}
        onUpdate={updatedProp => {
          setProperties(props =>
            props.map(p => (p.yardi === updatedProp.yardi ? updatedProp : p))
          );
          setEditingYardi(null);
        }}
      />
    );
  });
}