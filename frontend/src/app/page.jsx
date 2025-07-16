'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import axios from 'axios';
import PropertyList from './components/PropertyList';
import PropertyCard from './components/PropertyCard'
import PropertyDropdown from './components/PropertyDropdown';
import PropertySearch from './components/PropertySearch';
import PaginationControls from './components/PaginationControls';
import ViewToggle from './components/ViewToggle';
import PropertyGridView from './components/PropertyGridView';
import AddPropertyForm from './components/AddPropertyForm';
import LoginForm from './login'
import SessionTimeout from './components/SessionTimeout';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage ] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const { data: session } = useSession();
  const PropertiesPerPage = 18;
  const searchLower = search.toLowerCase();
  const [editingYardi, setEditingYardi] = useState(null);
  const [view, setView] = useState('card')
  const [showAddModal, setShowAddModal] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const filteredProperties = properties.filter( prop => {
    const fieldsToSearch = [
      prop.address,
      prop.yardi,
      prop.city,
      prop.zip,
      prop.building_type,
      prop.prop_manager,
      ...(prop.suites ? prop.suites.map(suite => suite.name) : []),
      ...(prop.services ? prop.services.map(service => service.vendor) : []),
      ...(prop.utilities ? prop.utilities.map(util => util.vendor) : []),
      ...(prop.codes ? prop.codes.map(code => code.description) : []),
    ];

    // Check if any field includes the search term
    return fieldsToSearch.some(field =>
      String(field || '').toLowerCase().includes(searchLower)
    );
  });

  // Sort filteredProperties by address before pagination
  const sortedProperties = [...filteredProperties].sort((a, b) =>
    (a.address || '').localeCompare(b.address || '')
  );

  // calculate pagination
  const indexOfLast = currentPage * PropertiesPerPage;
  const indexOfFirst = indexOfLast - PropertiesPerPage;
  const currentProperties = sortedProperties.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProperties.length / PropertiesPerPage);

  const fetchProperties = () => {
    axios.get(`${apiUrl}/properties`)
      .then(response => {
        setProperties(response.data.properties);
      })
      .catch(error => {
        console.error('There was an error fetching properties!', error);
      });
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // reset to first page if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Get selected property object (from filtered list, so search applies)
  const selectedProperty = filteredProperties.find(p => p.yardi === selectedPropertyId);

  // check if user is authenticated
  if (!session) {
    return <LoginForm />;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 w-full min-h-screen px-4 md:px-8 pt-8 md:pt-16 pb-4 md:pb-6">
      <h1 className="text-3xl md:text-4xl text-center md:text-left font-bold mb-4">Welcome to the PIS Platform</h1>
      <SessionTimeout />
      <AddPropertyForm
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchProperties}
      />
      <div className="flex justify-between">
        <PropertySearch
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setSelectedPropertyId(''); 
          }}
        />
        <div className="flex gap-2">
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
      {view === 'grid' ? (
        <PropertyGridView property={selectedProperty || currentProperties[0]} />
      ) : (
      <div
        className={`properties-list grid ${
          (selectedPropertyId || currentProperties.length === 1)
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
          onUpdate={updatedProp => {
            setProperties(props =>
              props.map(p => (p.yardi === updatedProp.yardi ? updatedProp : p))
            );
            setEditingYardi(null);
          }}
        />
      ) : (
        <PropertyList
          properties={currentProperties}
          editingYardi={editingYardi}
          setEditingYardi={setEditingYardi}
          setProperties={setProperties}
          searchLower={searchLower}
        />
        )}
      </div>
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => setCurrentPage(p => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
      />
    </div>
  );
}