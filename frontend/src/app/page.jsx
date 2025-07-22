"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import PropertyList from "./components/card/PropertyList";
import PropertyCard from "./components/card/PropertyCard";
import PropertyDropdown from "./components/common/PropertyDropdown";
import PropertySearch from "./components/common/PropertySearch";
import PaginationControls from "./components/common/PaginationControls";
import ViewToggle from "./components/common/ViewToggle";
import PropertyGridView from "./components/grid/PropertyGridView";
import AddPropertyForm from "./components/common/AddPropertyForm";
import LoginForm from "./Login";
import SessionTimeout from "./components/common/SessionTimeout";
import axiosInstance from "./utils/axiosInstance";
import { filterBySearch, paginate, getTotalPages, sort } from "./utils/helpers";

async function fetchProperties() {
  const res = await axiosInstance.get("/properties");
  return res.data.properties;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const { data: session } = useSession();
  const {
    data: properties = [],
    error,
    refetch,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchProperties,
  });
  const searchLower = search.toLowerCase();
  const PropertiesPerPage = 18;
  const [editingYardi, setEditingYardi] = useState(null);
  const [view, setView] = useState("card");
  const [showAddModal, setShowAddModal] = useState(false);

  const getFieldsToSearch = (prop) => [
    prop.address,
    prop.yardi,
    prop.city,
    prop.zip,
    prop.building_type,
    prop.prop_manager,
    ...(prop.suites ? prop.suites.map((suite) => suite.name) : []),
    ...(prop.services ? prop.services.map((service) => service.vendor) : []),
    ...(prop.utilities ? prop.utilities.map((util) => util.vendor) : []),
    ...(prop.codes ? prop.codes.map((code) => code.description) : []),
  ];

  const filteredProperties = filterBySearch(
    properties,
    getFieldsToSearch,
    search
  );

  // Sort filteredProperties by address before pagination
  const sortedProperties = sort(filteredProperties, "address");

  // calculate pagination
  const currentProperties = paginate(
    sortedProperties,
    currentPage,
    PropertiesPerPage
  );
  const totalPages = getTotalPages(filteredProperties, PropertiesPerPage);

  // reset to first page if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get selected property object (from filtered list, so search applies)
  const selectedProperty = filteredProperties.find(
    (p) => p.yardi === selectedPropertyId
  );

  // check if user is authenticated
  if (!session) {
    return <LoginForm />;
  }

  if (error) return <div>Error loading properties.</div>;

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 w-full min-h-screen px-4 md:px-8 pt-8 md:pt-16 pb-4 md:pb-6">
      <h1 className="text-3xl md:text-4xl text-center md:text-left font-bold mb-4 justify-between">
        Welcome to the PIS Platform
      </h1>
      <SessionTimeout />
      <AddPropertyForm
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetch}
      />
      <div className="md:flex justify-between">
        <PropertySearch
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedPropertyId("");
          }}
          placeholder="Search properties..."
        />
        <div className="md:flex space-x-4 md:space-x-1 gap-2">
          <button
            className="border bg-white px-3 py-1 mb-4 rounded hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => setShowAddModal(true)}
          >
            + Add Property
          </button>
          <ViewToggle view={view} onToggle={setView} />
          <PropertyDropdown
            properties={sortedProperties}
            selectedPropertyId={selectedPropertyId}
            onSelect={setSelectedPropertyId}
          />
        </div>
      </div>
      {view === "grid" ? (
        <PropertyGridView property={selectedProperty || currentProperties[0]} />
      ) : (
        <div
          className={`properties-list grid ${
            selectedPropertyId || currentProperties.length === 1
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          } gap-4`}
        >
          {selectedPropertyId ? (
            <PropertyCard
              key={selectedProperty.yardi}
              property={selectedProperty}
              editing={editingYardi === selectedProperty.yardi}
              onEdit={() => setEditingYardi(selectedProperty.yardi)}
              onCancelEdit={() => setEditingYardi(null)}
              onUpdate={() => {
                refetch();
                setEditingYardi(null);
              }}
            />
          ) : (
            <PropertyList
              properties={currentProperties}
              editingYardi={editingYardi}
              setEditingYardi={setEditingYardi}
              searchLower={searchLower}
            />
          )}
        </div>
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />
    </div>
  );
}
