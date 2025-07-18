import React, { useRef, useEffect, memo, useState } from "react";
import ContactInfoModal from "./ContactInfoModal";
import axiosInstance from "@/app/utils/axiosInstance";
import SuccessModal from "../common/SuccessModal"; 

export function AutoExpandTextarea({ value, onChange, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, []);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      className="border p-1 rounded w-full mt-1 resize-none"
      rows={1}
      {...props}
    />
  );
}

const emptyContact = {
  contact_id: undefined,
  name: "",
  office_number: "",
  cell_number: "",
  email: "",
};

const SubItem = memo(function SubItem({
  item,
  idx,
  type,
  fields,
  isEditing,
  onSave,
  setEditingIdx,
  onContactChange
}) {
  const uniqueKey = item.suite_id || item.service_id || item.utility_id || item.code_id;
  const [selectedContact, setSelectedContact] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handler for saving contact edits/adds
  const handleContactSave = async (contact, isNew) => {
    try {
      if (isNew) {
        const res = await axiosInstance.post('/contacts', contact);
        onContactChange(type, idx, res.data, true); 
      } else {
        const res = await axiosInstance.put(`/contacts/${contact.contact_id}`, contact);
        onContactChange(type, idx, res.data, false); 
      }
      setShowSuccess(true);
      setSelectedContact(null);
      setEditMode(false);
      
    } catch (error) {
      alert("Failed to save contact.");
    }
  };

  return (
    <div
      key={uniqueKey}
      className="flex flex-col border rounded-lg p-4 shadow-sm bg-gray-50 relative"
    >
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Contact saved!"
      />
      <div className="flex items-center justify-end">
        {isEditing ? (
          <button
            onClick={() => setEditingIdx(null)}
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setEditingIdx(idx)}
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 space-x-4">
        {fields.map((field, id) => {
          let value = item[field.id];
          if (
            field.id !== "contact" &&
            (value === undefined || value === null || value === "")
          ) {
            return null;
          }
          // Special rendering for contacts
          if (field.id === "contact") {
            return (
              <div key={field.id} className="mb-2 text-xs md:text-sm flex items-start">
                <label className="font-semibold mr-1 whitespace-nowrap">{field.label}:</label>
                <div className="flex-1">
                  {item.contacts && item.contacts.length > 0 ? (
                    <ul className="mt-1">
                      {item.contacts.map(contact => (
                        <li key={contact.contact_id} className="flex items-center gap-2">
                          <button
                            className="hover:underline hover:cursor-pointer"
                            type="button"
                            onClick={() => {
                              setSelectedContact(contact);
                              setEditMode(false);
                            }}
                          >
                            {contact.name}
                          </button>
                          {isEditing && (
                            <button
                              className="text-xs hover:cursor-pointer"
                              type="button"
                              title="Edit Contact"
                              onClick={() => {
                                setSelectedContact(contact);
                                setEditMode(true);
                              }}
                            >
                              ✏️
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400">No contacts</span>
                  )}
                  {isEditing && (
                    <button
                      className="mt-2 text-xs text-green-700 border border-green-700 px-2 py-1 rounded hover:bg-green-50 hover:cursor-pointer"
                      type="button"
                      onClick={() => {
                        setSelectedContact(emptyContact);
                        setEditMode(true);
                      }}
                    >
                      + Add Contact
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={field.id} className="mb-2 text-xs md:text-sm flex items-start">
              <label className="font-semibold mr-1 whitespace-nowrap">{field.label}:</label>
              <div className="flex-1">
                {isEditing ? (
                  <AutoExpandTextarea
                    value={value ?? ""}
                    onChange={e => onChange(type, idx, field.id, e.target.value)}
                  />
                ) : (
                  <span className="break-all whitespace-pre-line max-w-full inline-block align-bottom">
                    {value || <span className="text-gray-400">N/A</span>}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedContact && (
        <ContactInfoModal
          contact={selectedContact}
          onClose={() => {
            setSelectedContact(null);
            setEditMode(false);
          }}
          isEdit={editMode}
          onContactSave={handleContactSave}
        />
      )}
      <div className="flex justify-start mt-2">
        {isEditing && (
          <div>
            <button
              onClick={() => onSave(type, idx)}
              className="border border-black bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 hover:cursor-pointer"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default SubItem;