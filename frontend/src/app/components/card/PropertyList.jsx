import React from "react";
import PropertyCard from "./PropertyCard";

export default function PropertyList({
  properties,
  editingYardi,
  setEditingYardi,
  searchLower,
}) {
  return properties
    .map((property) => {
      const isEditing = editingYardi === property.yardi;

      // Check if property itself matches the search
      const propertyMatches =
        (property.address || "").toLowerCase().includes(searchLower) ||
        (property.yardi || "").toLowerCase().includes(searchLower) ||
        (property.city || "").toLowerCase().includes(searchLower) ||
        (property.zip || "").toString().toLowerCase().includes(searchLower) ||
        (property.building_type || "").toLowerCase().includes(searchLower) ||
        (property.prop_manager || "").toLowerCase().includes(searchLower);

      // If property matches or search is empty, show all nested data
      const filteredSuites =
        propertyMatches || !searchLower
          ? property.suites
          : (property.suites || []).filter((suite) =>
              (suite.name || "").toLowerCase().includes(searchLower)
            );
      const filteredServices =
        propertyMatches || !searchLower
          ? property.services
          : (property.services || []).filter((service) =>
              (service.vendor || "").toLowerCase().includes(searchLower)
            );
      const filteredUtilities =
        propertyMatches || !searchLower
          ? property.utilities
          : (property.utilities || []).filter((util) =>
              (util.vendor || "").toLowerCase().includes(searchLower)
            );
      const filteredCodes =
        propertyMatches || !searchLower
          ? property.codes
          : (property.codes || []).filter((code) =>
              (code.description || "").toLowerCase().includes(searchLower)
            );

      // Only show the property if it matches or any nested item matches
      if (
        propertyMatches ||
        filteredSuites.length ||
        filteredServices.length ||
        filteredUtilities.length ||
        filteredCodes.length
      ) {
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
            onUpdate={() => {
              setEditingYardi(null);
            }}
          />
        );
      }
      return null;
    })
    .filter(Boolean);
}
