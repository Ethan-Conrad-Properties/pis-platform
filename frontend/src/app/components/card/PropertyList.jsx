import React from "react";
import PropertyCard from "./PropertyCard";

/**
 * PropertyList Component
 *
 * Renders a list of properties as individual PropertyCard components.
 * Handles filtering of properties and their nested entities (suites, services, utilities, codes)
 * based on a search string. It also supports "edit mode" toggling for a property via yardi ID.
 *
 * Props:
 * - properties (Array): List of property objects, each with nested suites, services, utilities, and codes.
 * - editingYardi (string|null): The yardi ID of the property currently being edited.
 * - setEditingYardi (function): Callback to update which property is being edited.
 * - searchLower (string): Lowercased search string for filtering properties and nested items.
 * - isLoading (boolean): Whether property data is currently loading.
 * - error (boolean): Whether there was an error fetching property data.
 */
export default function PropertyList({
  properties,
  editingYardi,
  setEditingYardi,
  searchLower,
  isLoading,
  error,
}) {
  // Handle loading state
  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading properties...</div>;
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">Error loading property.</div>
    );
  }

  // Handle empty list
  if (!properties || properties.length === 0) {
    return <div className="p-4 text-sm text-gray-500">Property not found.</div>;
  }

  // Main rendering loop
  return properties
    .map((property) => {
      const isEditing = editingYardi === property.yardi;

      // Check if property itself matches the search string
      const propertyMatches =
        (property.address || "").toLowerCase().includes(searchLower) ||
        (property.yardi || "").toLowerCase().includes(searchLower) ||
        (property.city || "").toLowerCase().includes(searchLower) ||
        (property.zip || "").toString().toLowerCase().includes(searchLower) ||
        (property.building_type || "").toLowerCase().includes(searchLower) ||
        (property.prop_manager || "").toLowerCase().includes(searchLower);

      // Suites: filter only if property does not directly match
      const filteredSuites =
        propertyMatches || !searchLower
          ? property.suites
          : (property.suites || []).filter((suite) =>
              (suite.name || "").toLowerCase().includes(searchLower)
            );

      // Services: filter only if property does not directly match
      const filteredServices =
        propertyMatches || !searchLower
          ? property.services
          : (property.services || []).filter((service) =>
              (service.vendor || "").toLowerCase().includes(searchLower)
            );

      // Utilities: filter only if property does not directly match
      const filteredUtilities =
        propertyMatches || !searchLower
          ? property.utilities
          : (property.utilities || []).filter((util) =>
              (util.vendor || "").toLowerCase().includes(searchLower)
            );

      // Codes: filter only if property does not directly match
      const filteredCodes =
        propertyMatches || !searchLower
          ? property.codes
          : (property.codes || []).filter((code) =>
              (code.description || "").toLowerCase().includes(searchLower)
            );

      // Only render the property card if the property itself OR any nested data matches
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

      // Skip if no matches
      return null;
    })
    .filter(Boolean); // Remove nulls from skipped properties
}
