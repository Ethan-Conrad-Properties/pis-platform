"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FaHistory, FaLink } from "react-icons/fa";

import PropertyList from "./components/card/PropertyList";
import PropertyCard from "./components/card/PropertyCard";
import PropertyDropdown from "./components/common/PropertyDropdown";
import PropertySearch from "./components/common/PropertySearch";
import PaginationControls from "./components/common/PaginationControls";
import ViewToggle from "./components/common/ViewToggle";
import PropertyGridView from "./components/grid/PropertyGridView";
import AddPropertyForm from "./components/common/AddPropertyForm";
import LoginForm from "./Login";

import axiosInstance from "./utils/axiosInstance";
import { filterBySearch, paginate, getTotalPages, sort } from "./utils/helpers";
import { isDirector, isIT } from "./constants/roles";

import "@n8n/chat/style.css";

// ---------------------------------------------------
// Fetch first page of properties from backend
// (React Query handles caching/retries)
// ---------------------------------------------------
async function fetchFirstPage() {
  const res = await axiosInstance.get("/properties", {
    params: { page: 1, per_page: 10 },
  });
  return res.data;
}

/**
 * Home Page
 *
 * Main landing page of the PIS Platform.
 * Responsibilities:
 * - Fetch all properties (with nested suites, services, utilities, codes).
 * - Support search, sorting, pagination.
 * - Switch between card view and grid view.
 * - Allow directors/IT to add new properties.
 * - Provide quick navigation (Quick Links, Edit History).
 * - Integrate chatbot (via n8n).
 */
export default function Home() {
  // ---------------- State ----------------
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [properties, setProperties] = useState([]); // all properties loaded progressively
  const [editingYardi, setEditingYardi] = useState(null);
  const [view, setView] = useState("card"); // "card" | "grid"
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: session } = useSession();

  // ---------------- Data fetching ----------------
  const {
    data: firstPageData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["properties", "page1", 20],
    queryFn: fetchFirstPage,
    enabled: !!session, // only fetch if logged in
  });

  // Progressive loading: load page 1, then fetch rest in background
  useEffect(() => {
    if (!firstPageData) return;

    let isCancelled = false;
    setProperties(firstPageData.properties);

    (async () => {
      const totalPages = firstPageData.total_pages || 1;
      for (let p = 2; p <= totalPages; p++) {
        if (isCancelled) break;
        const res = await axiosInstance.get("/properties", {
          params: { page: p, per_page: 10 },
        });
        if (isCancelled) break;
        setProperties((prev) => [...prev, ...res.data.properties]);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [firstPageData]);

  // ---------------- Filtering + sorting ----------------
  const getFieldsToSearch = (prop) => [
    prop.address,
    prop.yardi,
    prop.city,
    prop.zip,
    prop.building_type,
    prop.prop_manager,
    ...(prop.suites ? prop.suites.map((suite) => suite.name) : []),
    ...(prop.services ? prop.services.map((service) => service.vendor) : []),
    ...(prop.services ? prop.services.map((service) => service.type) : []),
    ...(prop.utilities ? prop.utilities.map((util) => util.vendor) : []),
    ...(prop.codes ? prop.codes.map((code) => code.description) : []),
  ];

  const filteredProperties = filterBySearch(properties, getFieldsToSearch, search);
  const sortedProperties = sort(filteredProperties, "address");

  // Paginate results
  const PropertiesPerPage = 20;
  const currentProperties = paginate(sortedProperties, currentPage, PropertiesPerPage);
  const totalPages = getTotalPages(filteredProperties, PropertiesPerPage);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const selectedProperty = filteredProperties.find((p) => p.yardi === selectedPropertyId);

  // Debug logging
  useEffect(() => {
    console.log("Session object:", session);
    console.log("Properties: ", properties);
  }, [properties, session]);

  // ---------------- Auth guard ----------------
  if (!session) {
    return <LoginForm />;
  }

  // ---------------- Render ----------------
  return (
    <div className="px-4 md:px-8 pt-4 md:pt-10 pb-4 md:pb-6">
      {/* Header */}
        <h1 className="text-2xl md:text-4xl font-bold text-left mb-2 md:mb-6">
          Welcome to the PIS Platform
        </h1>

      {/* Modal for adding properties */}
      <AddPropertyForm
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetch}
      />

      {/* Search + top controls */}
      <div className="md:flex justify-between">
        <PropertySearch
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedPropertyId("");
          }}
          placeholder="Search properties..."
        />
        <div className="md:flex space-x-4 md:space-x-1 gap-2 items-center">
          {/* Quick Links */}
          <button className="flex p-1 items-center rounded mb-4 hover:cursor-pointer hover:underline">
            <Link href="/quick-links">Quick Links</Link>
            <FaLink className="ml-1" />
          </button>

          {/* Edit history (directors + IT only) */}
          {(isDirector(session) || isIT(session)) && (
            <button className="flex p-1 items-center rounded mb-4 hover:cursor-pointer hover:underline">
              <Link href="/edit-history">View Edit History</Link>
              <FaHistory className="ml-1" />
            </button>
          )}

          {/* Add property (directors only) */}
          {isDirector(session) && (
            <button
              className="border bg-white px-3 py-1 mb-4 rounded hover:bg-gray-100 hover:cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              + Add Property
            </button>
          )}

          {/* View toggle: card vs grid */}
          <ViewToggle view={view} onToggle={setView} />

          {/* Dropdown: jump to a property */}
          <PropertyDropdown
            properties={sort(properties, "address")}
            selectedPropertyId={selectedPropertyId}
            onSelect={setSelectedPropertyId}
          />
        </div>
      </div>

      {/* Main content: grid or card view */}
      {view === "grid" ? (
        <PropertyGridView
          property={selectedProperty || currentProperties[0]}
          isLoading={isLoading}
          error={error}
        />
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
              searchLower={search.toLowerCase()}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      )}

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
      />
    </div>
  );
}
