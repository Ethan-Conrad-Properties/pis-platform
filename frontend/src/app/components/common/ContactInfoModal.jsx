import React, { useState, useEffect } from "react";

export default function ContactInfoModal({
  contact,
  onClose,
  isEdit,
  onContactSave,
}) {
  const [form, setForm] = useState(contact);

  useEffect(() => {
    setForm(contact);
  }, [contact]);

  if (!contact) return null;

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onContactSave(form, !contact.contact_id);
    } catch (error) {
      alert("Failed to save contact.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg min-w-[250px]"
        onClick={(e) => e.stopPropagation()}
      >
        {isEdit ? (
          <>
            <input
              className="border p-1 rounded w-full mb-2"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Name"
            />
            <input
              className="border p-1 rounded w-full mb-2"
              value={form.office_number || ""}
              onChange={(e) => handleChange("office_number", e.target.value)}
              placeholder="Office Number"
            />
            <input
              className="border p-1 rounded w-full mb-2"
              value={form.cell_number || ""}
              onChange={(e) => handleChange("cell_number", e.target.value)}
              placeholder="Cell Number"
            />
            <input
              className="border p-1 rounded w-full mb-2"
              value={form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Email Address"
            />
            <div className="flex gap-2 mt-2">
              <button
                className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="border border-blue-600 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 hover:cursor-pointer"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-2">{contact.name}</h2>
            <div>
              <span className="font-semibold">Office Number:</span>{" "}
              {contact.office_number ? (
                <a href={`tel:${contact.office_number}`} className="text-blue-600 underline">
                  {contact.office_number}
                </a>
              ) : "N/A"}
            </div>
            <div>
              <span className="font-semibold">Cell Number:</span>{" "}
              {contact.cell_number ? (
                <a href={`tel:${contact.cell_number}`} className="text-blue-600 underline">
                  {contact.cell_number}
                </a>
              ) : "N/A"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 underline"
                >
                  {contact.email}
                </a>
              ) : (
                "N/A"
              )}
            </div>
            <button
              className="mt-4 border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
