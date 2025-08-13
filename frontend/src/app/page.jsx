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
import { FaHistory } from "react-icons/fa";
import Link from "next/link"
import { isDirector, isIT, isPM, isBroker } from "./constants/roles";
import { signOut } from "next-auth/react";
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

async function fetchFirstPage() {
  const res = await axiosInstance.get("/properties", {
    params: { page: 1, per_page: 20 },  
  });
  return res.data; 
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const { data: session } = useSession();

  // local accumulator so we can append subsequent pages
  const [properties, setProperties] = useState([]);

  const {
    data: firstPageData,   
    error,
    refetch
  } = useQuery({
    queryKey: ["properties", "page1", 20],
    queryFn: fetchFirstPage,
    enabled: !!session,
  });

  // After page 1 arrives, append it, then fetch pages 2..N in the background
  useEffect(() => {
    if (!firstPageData) return;

    let isCancelled = false;
    setProperties(firstPageData.properties); // paint immediately

    (async () => {
      const totalPages = firstPageData.total_pages || 1;
      for (let p = 2; p <= totalPages; p++) {
        if (isCancelled) break;
        const res = await axiosInstance.get("/properties", {
          params: { page: p, per_page: 20 },
        });
        if (isCancelled) break;
        setProperties(prev => [...prev, ...res.data.properties]);
      }
    })();

    return () => { isCancelled = true; };
  }, [firstPageData]);

  const searchLower = search.toLowerCase();
  const PropertiesPerPage = 20;
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
    ...(prop.services ? prop.services.map((service) => service.type) : []),
    ...(prop.utilities ? prop.utilities.map((util) => util.vendor) : []),
    ...(prop.codes ? prop.codes.map((code) => code.description) : []),
  ];

  // Use the progressively loaded `properties`
  const filteredProperties = filterBySearch(
    properties,
    getFieldsToSearch,
    search
  );

  const sortedProperties = sort(filteredProperties, "address");

  const currentProperties = paginate(
    sortedProperties,
    currentPage,
    PropertiesPerPage
  );
  const totalPages = getTotalPages(filteredProperties, PropertiesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const selectedProperty = filteredProperties.find(
    (p) => p.yardi === selectedPropertyId
  );

  useEffect(() => {
    if (properties.length > 0) {
      createChat({
        webhookUrl: 'https://n8n.srv945784.hstgr.cloud/webhook/82cc73c3-a75f-4542-b7bf-a036201b1351/chat',
        initialMessages: [
          'I am your personal PIS chatbot. How can I assist you today?'
        ],
        i18n: {
          en: {
            title: 'Hi there! 👋',
            subtitle: "Start a chat. I'm here to help you 24/7.",
            inputPlaceholder: 'Type your question..',
          },
        },
      });
    }
  }, [properties]);

  useEffect(() => {
    console.log("Session object:", session);
    console.log("Properties: ", properties)
  }, [properties, session]);

  if (!session) {
    return <LoginForm />;
  }

  if (error) return <div>Error loading properties.</div>;

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 w-full min-h-screen px-4 md:px-8 pt-8 md:pt-16 pb-4 md:pb-6 relative">
      <button
        onClick={() => signOut()}
        className="absolute top-4 right-4 bg-white border border-black px-3 py-1 rounded shadow hover:bg-gray-100 cursor-pointer z-50"
      >
        Logout
      </button>
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
        <div className="md:flex space-x-4 md:space-x-1 gap-2 items-center">
          <button
            className=" flex p-1 items-center rounded mb-4 hover:cursor-pointer hover:underline"
          >
            <Link href="/edit-history">View Edit History</Link>
            <FaHistory
              className="ml-1"
            />
          </button>
          {isDirector(session) && (
            <button
              className="border bg-white px-3 py-1 mb-4 rounded hover:bg-gray-100 hover:cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              + Add Property
            </button>
          )}
          {(isDirector(session) || isPM(session) || isIT(session) || isBroker(session)) && (
            <>
              <ViewToggle view={view} onToggle={setView} />
            </>
          )}
          <PropertyDropdown
              properties={sort(properties, "address")}
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
