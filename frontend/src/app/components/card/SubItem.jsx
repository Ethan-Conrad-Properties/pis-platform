import React, { useRef, useEffect, memo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ContactInfoModal from "../common/ContactInfoModal";
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

function SeeMoreText({ text, maxLength = 500 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <span className="text-gray-400">N/A</span>;
  if (text.length <= maxLength) return <span>{text}</span>;
  return (
    <span>
      {expanded ? text : text.slice(0, maxLength) + "... "}
      <button
        className="text-blue-600 underline text-xs hover:cursor-pointer"
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </span>
  );
}

const SubItem = memo(function SubItem({
  item,
  idx,
  type,
  fields,
  isEditing,
  onChange,
  onSave,
  setEditingIdx,
  onContactChange,
}) {
  const uniqueKey =
    item.suite_id || item.service_id || item.utility_id || item.code_id;
  const [selectedContact, setSelectedContact] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addContactMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/contacts", payload),
    onError: () => alert("Failed to save contact."),
  });

  const editContactMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/contacts/${payload.contact_id}`, payload),
    onError: () => alert("Failed to save contact."),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId) => axiosInstance.delete(`/contacts/${contactId}`),
    onError: () => alert("Failed to delete contact."),
  });

  // Handler for saving contact edits/adds
  const handleContactSave = async (contact, isNew) => {
    const parentId = item.suite_id || item.service_id || item.utility_id;
    const parentType = item.suite_id
      ? "suite_id"
      : item.service_id
      ? "service_id"
      : item.utility_id
      ? "utility_id"
      : null;

    const payload = {
      ...contact,
      ...(parentType && { [parentType]: parentId }),
    };

    let res;
    if (isNew) {
      res = await addContactMutation.mutateAsync(payload);
      onContactChange(type, idx, res.data, "add");
    } else {
      res = await editContactMutation.mutateAsync(payload);
      onContactChange(type, idx, res.data, "edit");
    }
    setShowSuccess(true);
    setSelectedContact(null);
    setEditMode(false);
  };

  // Handler for deleting a contact
  const handleContactDelete = async (contactId) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await deleteContactMutation.mutateAsync(contactId);
      onContactChange(type, idx, { contact_id: contactId }, "delete");
      setShowSuccess(true);
    } catch (error) {
      // Error handled by mutation's onError
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
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer mb-2"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setEditingIdx(idx)}
            className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer mb-2"
          >
            Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        {fields.map((field, id) => {
          let value = item[field.id];
          if (
            field.id !== "contact" &&
            field.id !== "notes" &&
            (value === undefined || value === null || value === "")
          ) {
            return null;
          }
          // Special rendering for contacts
          if (field.id === "contact") {
            return (
              <div
                key={field.id}
                className="mb-2 text-xs md:text-sm flex flex-col md:flex-row items-start"
              >
                <label className="font-semibold mb-1 md:mb-0 md:mr-1 whitespace-nowrap">
                  {field.label}:
                </label>
                <div className="flex-1">
                  {item.contacts && item.contacts.length > 0 ? (
                    <ul>
                      {item.contacts.map((contact) => (
                        <li
                          key={contact.contact_id}
                          className="flex items-center gap-2"
                        >
                          <button
                            className="hover:underline hover:cursor-pointer align-middle"
                            type="button"
                            onClick={() => {
                              setSelectedContact(contact);
                              setEditMode(false);
                            }}
                          >
                            {contact.name}
                          </button>
                          {isEditing && (
                            <>
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
                              <button
                                className="text-xs text-red-600 hover:cursor-pointer"
                                type="button"
                                title="Delete Contact"
                                onClick={() =>
                                  handleContactDelete(contact.contact_id)
                                }
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span></span>
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
            <div
              key={field.id}
              className="mb-2 text-xs md:text-sm flex flex-col md:flex-row items-start"
            >
              <label className="font-semibold mb-1 md:mb-0 md:mr-1 whitespace-nowrap">
                {field.label}:
              </label>
              <div className="flex-1">
                {isEditing ? (
                  <AutoExpandTextarea
                    value={value ?? ""}
                    onChange={(e) =>
                      onChange(type, idx, field.id, e.target.value)
                    }
                  />
                ) : (
                  <span className="break-all whitespace-pre-line max-w-full inline-block align-bottom">
                    <SeeMoreText text={value} />
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
