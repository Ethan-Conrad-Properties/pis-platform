import React, { useState, useEffect } from "react";
import axiosInstance from "@/app/utils/axiosInstance";
import Image from "next/image";

/**
 * PropertyPhotos Component
 *
 * Manages photo uploads, previews, display, and deletion for a given property.
 * Supports two modes:
 *  - Viewing: shows the list of photos with captions.
 *  - Editing: allows file uploads, caption entry, preview, and deletion of photos.
 *
 * Props:
 * - propertyYardi (string): The Yardi ID of the property, used to fetch and store photos.
 * - editing (boolean): If true, enables upload/delete features; otherwise, photos are view-only.
 *
 * Behavior:
 * - Fetches photos on mount (or when propertyYardi changes).
 * - Uploads photos in two steps:
 *    1. POST the file to `/property-photos/upload` → returns a URL.
 *    2. POST metadata (property_yardi, photo_url, caption) to `/property-photos`.
 * - Shows a preview of a photo before uploading.
 * - Deletes photos when requested, then updates local state.
 */
export default function PropertyPhotos({ propertyYardi, editing }) {
  const [photos, setPhotos] = useState([]); // List of photos for this property
  const [uploading, setUploading] = useState(false); // Upload in progress state
  const [previewUrl, setPreviewUrl] = useState(null); // Local preview of selected file

  // Fetch all photos for a property when component mounts or property changes
  useEffect(() => {
    async function fetchPhotos() {
      if (propertyYardi) {
        const res = await axiosInstance.get(`/property-photos/${propertyYardi}`);
        setPhotos(res.data);
      }
    }
    fetchPhotos();
  }, [propertyYardi]);

  // Handle deleting a photo
  const handleDelete = async (photoId) => {
    await axiosInstance.delete(`/property-photos/${photoId}`);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Handle uploading a new photo with caption
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const file = e.target.elements.photo.files[0];
      const caption = e.target.elements.caption.value;
      if (!file) throw new Error("No file selected");

      // File size limit: 10 MB
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be 10 MB or less.");
        setUploading(false);
        return;
      }

      // Step 1: Upload file to backend
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await axiosInstance.post("/property-photos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Step 2: Save metadata (property association + caption)
      const metaData = new FormData();
      metaData.append("property_yardi", propertyYardi);
      metaData.append("photo_url", uploadRes.data.url);
      metaData.append("caption", caption);
      await axiosInstance.post("/property-photos", metaData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Step 3: Refresh list of photos
      const res = await axiosInstance.get(`/property-photos/${propertyYardi}`);
      setPhotos(res.data);

      // Reset form state
      e.target.reset();
      setPreviewUrl(null);
    } catch (err) {
      alert(
        "Error uploading photo: " +
          (err?.response?.data?.detail || err?.message || "Unknown error")
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      {/* Upload form visible only in editing mode */}
      {editing && (
        <form onSubmit={handleUpload} className="mb-4 flex items-center gap-2">
          {/* File input with preview */}
          <label
            htmlFor="photo-upload"
            className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 cursor-pointer"
          >
            Choose Photo
            <input
              id="photo-upload"
              type="file"
              name="photo"
              accept="image/*"
              required
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPreviewUrl(URL.createObjectURL(file));
                } else {
                  setPreviewUrl(null);
                }
              }}
            />
          </label>

          {/* Caption input */}
          <input
            type="text"
            name="caption"
            placeholder="Caption"
            className="border p-1 rounded"
          />

          {/* Submit button */}
          <button
            type="submit"
            className="px-2 py-1 border rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>

          {/* Local preview */}
          {previewUrl && (
            <div className="ml-4">
              <span className="block text-sm text-gray-500 mb-2">Preview:</span>
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover rounded w-48 h-32 border"
              />
            </div>
          )}
        </form>
      )}

      {/* Photo list */}
      {photos.length === 0 ? (
        <div className="text-gray-500">No photos listed.</div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="w-64">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${photo.photo_url}`}
                alt={photo.caption || "Property Photo"}
                width={256}
                height={192}
                className="object-cover rounded w-full h-40"
                // Fallback image if the source fails to load
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/no-image.png";
                }}
              />
              <div className="text-base mt-2 font-medium">{photo.caption}</div>
              {editing && (
                <button
                  className="text-red-600 text-xs cursor-pointer"
                  onClick={() => handleDelete(photo.id)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
