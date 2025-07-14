'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"
import axios from 'axios';
import PropertyCard from './components/PropertyCard'
import LoginForm from './Login'

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage ] = useState(1);
  // const { data: session } = useSession();
  const PropertiesPerPage = 18;
  const searchLower = search.toLowerCase();
  const [editingYardi, setEditingYardi] = useState(null);

  const filteredProperties = properties.filter( prop => {
    const fieldsToSearch = [
      prop.address,
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

  useEffect(() => {
    axios.get('http://localhost:8000/properties')
      .then(response => {
        setProperties(response.data.properties);
      })
      .catch(error => {
        console.error('There was an error fetching properties!', error);
      });
  }, []);

  // reset to first page if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // check if user is authenticated
  // if (!session) {
  //   return <LoginForm />;
  // }

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-orange-200 min-h-screen px-8 pt-16 pb-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to the PIS Platform</h1>
      <input 
        type="text"
        placeholder="Search properties..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border border-black rounded w-full md:w-1/4"
      />
      <div
        className={`properties-list grid ${
          currentProperties.length === 1
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2"
        } gap-4`}
      >
      {currentProperties.map(property => {
        const isEditing = editingYardi === property.yardi;
        const filteredSuites = !isEditing && search 
          ? property.suites?.filter(suite =>
              String(suite.name || '').toLowerCase().includes(searchLower)
            ) || []
          : property.suites;
        const filteredServices = !isEditing && search 
          ? property.services?.filter(service =>
              String(service.vendor || '').toLowerCase().includes(searchLower)
            ) || []
          : property.services;
        const filteredUtilities = !isEditing && search 
          ? property.utilities?.filter(util =>
              String(util.vendor || '').toLowerCase().includes(searchLower)
            ) || []
          : property.utilities;
        const filteredCodes = !isEditing && search 
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
      })}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50 hover:cursor-pointer"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50 hover:cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}