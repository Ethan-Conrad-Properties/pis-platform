import React, { useState } from "react";
import axiosInstance from '../utils/axiosInstance';

export default function AddPropertyForm({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    yardi: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    prop_manager: null,
    coe: null,
    num_buildings: null,
    apn: null,
    prop_tax_id: null,
    net_rentable_area: null,
    land_area: null,
    structural_frame: null,
    roof_type: null,
    year_built: null,
    year_rent: null,
    num_stories: null,
    parking: null,
    fire_sprinklers: null,
    heat_cooling_source: null,
    foundation: null,
    roof_cover: null,
    building_type: null,
    total_sq_ft: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
    	await axiosInstance.post(`/properties`, form);
      setForm({
        yardi: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        prop_manager: null,
        coe: null,
        num_buildings: null,
        apn: null,
        prop_tax_id: null, 
        net_rentable_area: null,  
        land_area: null,
        structural_frame: null,
        roof_type: null,
        year_built: null,
        year_rent: null,
        num_stories: null,
        parking: null,
        fire_sprinklers: null,
        heat_cooling_source: null,
        foundation: null,
        roof_cover: null,
        building_type: null,
        total_sq_ft: null,
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError("Failed to add property. Make sure all required fields are filled and yardi is unique.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
      <div className="bg-white rounded shadow-lg p-6 min-w-[350px] max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl hover:cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Add New Property</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <input name="yardi" value={form.yardi ?? ""} onChange={handleChange} placeholder="Yardi ID" required className="border px-2 py-1 rounded" />
            <input name="address" value={form.address ?? ""} onChange={handleChange} placeholder="Address" required className="border px-2 py-1 rounded" />
            <input name="city" value={form.city ?? ""} onChange={handleChange} placeholder="City" className="border px-2 py-1 rounded" />
            <input name="state" value={form.state ?? ""} onChange={handleChange} placeholder="State" className="border px-2 py-1 rounded" />
            <input name="zip" value={form.zip ?? ""} onChange={handleChange} placeholder="Zip" className="border px-2 py-1 rounded" />
            <input name="prop_manager" value={form.prop_manager} onChange={handleChange} placeholder="Property Manager" className="border px-2 py-1 rounded" />
            <input name="building_type" value={form.building_type} onChange={handleChange} placeholder="Building Type" className="border px-2 py-1 rounded" />
            <input name="total_sq_ft" value={form.total_sq_ft} onChange={handleChange} placeholder="Total Sq Ft" className="border px-2 py-1 rounded" />
          </div>
          <div className="flex flex-wrap gap-2">
            <input name="coe" value={form.coe ?? ""} onChange={handleChange} placeholder="COE" className="border px-2 py-1 rounded" />
            <input name="num_buildings" value={form.num_buildings ?? ""} onChange={handleChange} placeholder="# Buildings" className="border px-2 py-1 rounded" />
            <input name="apn" value={form.apn ?? ""} onChange={handleChange} placeholder="APN #" className="border px-2 py-1 rounded" />
            <input name="prop_tax_id" value={form.prop_tax_id ?? ""} onChange={handleChange} placeholder="Property Tax ID #" className="border px-2 py-1 rounded" />
            <input name="net_rentable_area" value={form.net_rentable_area ?? ""} onChange={handleChange} placeholder="Net Rentable Area" className="border px-2 py-1 rounded" />
            <input name="land_area" value={form.land_area ?? ""} onChange={handleChange} placeholder="Land Area" className="border px-2 py-1 rounded" />
            <input name="structural_frame" value={form.structural_frame ?? ""} onChange={handleChange} placeholder="Structural Frame" className="border px-2 py-1 rounded" />
            <input name="roof_type" value={form.roof_type ?? ""} onChange={handleChange} placeholder="Roof Type" className="border px-2 py-1 rounded" />
            <input name="year_built" value={form.year_built ?? ""} onChange={handleChange} placeholder="Year Built" className="border px-2 py-1 rounded" />
            <input name="year_rent" value={form.year_rent ?? ""} onChange={handleChange} placeholder="Year Rent" className="border px-2 py-1 rounded" />
            <input name="num_stories" value={form.num_stories ?? ""} onChange={handleChange} placeholder="# Stories" className="border px-2 py-1 rounded" />
            <input name="parking" value={form.parking ?? ""} onChange={handleChange} placeholder="Parking" className="border px-2 py-1 rounded" />
            <input name="fire_sprinklers" value={form.fire_sprinklers ?? ""} onChange={handleChange} placeholder="Fire Sprinklers" className="border px-2 py-1 rounded" />
            <input name="heat_cooling_source" value={form.heat_cooling_source ?? ""} onChange={handleChange} placeholder="Heat/Cooling Source" className="border px-2 py-1 rounded" />
            <input name="foundation" value={form.foundation ?? ""} onChange={handleChange} placeholder="Foundation" className="border px-2 py-1 rounded" />
            <input name="roof_cover" value={form.roof_cover ?? ""} onChange={handleChange} placeholder="Roof Cover" className="border px-2 py-1 rounded" />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 hover:cursor-pointer"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 hover:cursor-pointer"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}