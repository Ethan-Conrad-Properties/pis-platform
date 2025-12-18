import React, { useRef, useEffect, memo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ContactInfoModal from "../common/ContactInfoModal";
import axiosInstance from "@/app/utils/axiosInstance";
import SuccessModal from "../common/SuccessModal";
import { isDirector, isPM, isIT, isAP } from "@/app/constants/roles";
import { useSession } from "next-auth/react";
import { stripHtml } from "@/app/utils/helpers";
import Linkify from "linkify-react";

/**
 * AutoExpandTextarea
 *
 * Textarea that automatically grows/shrinks its height
 * based on content (removes need for manual resizing).
 *
 * Props:
 * - value: Current string value
 * - onChange: Change handler (standard textarea signature)
 * - ...props: Any other props passed down to <textarea>
 */
export function AutoExpandTextarea({ value, onChange, ...props }) {
  const ref = useRef(null);

  // Recompute height on value change
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  // Initial auto-resize
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

// Empty contact template used when adding a new one
const emptyContact = {
  contact_id: undefined,
  name: "",
  office_number: "",
  cell_number: "",
  email: "",
};

/**
 * SeeMoreText
 *
 * Collapsible text display for long strings.
 * If text exceeds maxLength, truncates with "Show more".
 *
 * Props:
 * - text: string to display
 * - maxLength (default 500): truncation threshold
 */
function SeeMoreText({ text, maxLength = 500 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return <span className="text-gray-400">N/A</span>;

  const isString = typeof text === "string";
  const displayText = isString && !expanded ? text.slice(0, maxLength) : text;

  return (
    <span>
      {displayText}
      {isString && text.length > maxLength && (
        <>
          {!expanded && "... "}
          <button
            className="text-blue-600 underline text-xs hover:cursor-pointer"
            type="button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </>
      )}
    </span>
  );
}

function RenderTextWithLinks({ text }) {
  if (!text) return <span className="text-gray-400">N/A</span>;

  return (
    <Linkify
      options={{
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-blue-600 underline",
      }}
    >
      {text}
    </Linkify>
  );
}

/**
 * SubItem
 *
 * A card-like component representing a nested record
 * (suite, service, utility, or code).
 *
 * Responsibilities:
 * - Render fields in view or edit mode.
 * - Handle contacts (add/edit/delete) through ContactInfoModal.
 * - Allow saving/deleting sub-entities.
 * - Enforce role-based permissions for editing.
 *
 * Props:
 * - item: The entity data object (suite, service, etc.)
 * - id: id of this item in parent list
 * - type: Section type ("suites" | "services" | "utilities" | "codes")
 * - fields: List of field configs {id, label}
 * - isEditing: Boolean — true if currently editing this record
 * - onChange: (type, id, field, value) → update handler for text fields
 * - onSave: (type, id) → save handler
 * - setEditingId: Setter for controlling which sub-item is being edited
 * - onContactChange: (type, id, contact, action) → contact CRUD handler
 * - onDelete: (type, id) → delete handler for the sub-item
 */
const SubItem = memo(function SubItem({
  item,
  id,
  type,
  fields,
  isEditing,
  onChange,
  onSave,
  setEditingId,
  onContactChange,
  onDelete,
}) {
  const [selectedContact, setSelectedContact] = useState(null);
  const [editMode, setEditMode] = useState(false); // toggle between view vs edit contact
  const [showSuccess, setShowSuccess] = useState(false);
  const [editBuffers, setEditBuffers] = useState({});
  const { data: session } = useSession();

  // Mutations for contacts
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

  /**
   * Save a contact (new or existing).
   * Also associates the contact with the correct parent entity.
   */
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
      onContactChange(type, id, res.data, "add");
    } else {
      res = await editContactMutation.mutateAsync(payload);
      onContactChange(type, id, res.data, "edit");
    }
    setShowSuccess(true);
    setSelectedContact(null);
    setEditMode(false);
  };

  /**
   * Delete a contact (with confirmation).
   */
  const handleContactDelete = async (contactId) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await deleteContactMutation.mutateAsync(contactId);
      onContactChange(type, id, { contact_id: contactId }, "delete");
      setShowSuccess(true);
    } catch {
      // Errors handled by mutation's onError
    }
  };

  /**
   * Delete the entire sub-entity (suite/service/etc).
   */
  const handleDeleteClick = () => {
    const singular = type.slice(0, -1); // crude singularization
    if (!window.confirm(`Delete this ${singular}?`)) return;
    onDelete(type, id);
  };

  useEffect(() => {
    if (isEditing) {
      const init = {};
      fields.forEach((f) => {
        init[f.id] = stripHtml(item[f.id] ?? "");
      });
      setEditBuffers(init);
    }
  }, [isEditing, item, fields]);

  return (
    <div
      key={id}
      className="flex flex-col border rounded-lg p-4 shadow-sm bg-gray-50 relative"
      style={{
        background: "var(--surface)",
        color: "var(--surface-foreground)",
      }}
    >
      {/* Toast on successful contact save */}
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Contact saved!"
      />

      {/* Role-based action buttons (delete, edit, cancel) */}
      {(isDirector(session) ||
        isPM(session) ||
        isIT(session) ||
        isAP(session)) && (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleDeleteClick}
            className="border border-red-600 text-red-700 px-2 py-1 rounded hover:bg-red-50 hover:cursor-pointer mb-2"
            type="button"
            title="Delete"
          >
            Delete
          </button>
          {isEditing ? (
            <button
              onClick={() => {
                const isTemp = typeof id === "string" && id.startsWith("temp-");

                if (isTemp) {
                  // 🧹 Unsaved row → remove from UI only
                  onDelete(type, id);
                }

                // 🛑 Saved row → just exit edit mode
                setEditingId(null);
              }}
              className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer mb-2"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setEditingId(id)}
              className="border border-black px-2 py-1 rounded hover:bg-gray-100 hover:cursor-pointer mb-2"
            >
              Edit
            </button>
          )}
        </div>
      )}

      {/* Field rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        {fields.map((field) => {
          let value = item[field.id];

          // Special case: contacts field
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

          // Default case: normal text field
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
                    value={editBuffers[field.id] ?? ""}
                    onChange={(e) => {
                      setEditBuffers((prev) => ({
                        ...prev,
                        [field.id]: e.target.value,
                      }));
                      onChange(type, id, field.id, e.target.value);
                    }}
                  />
                ) : (
                  <span className="break-all whitespace-pre-line max-w-full inline-block align-bottom">
                    <SeeMoreText
                      text={<RenderTextWithLinks text={stripHtml(value)} />}
                    />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact modal */}
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

      {/* Save button (visible when editing) */}
      <div className="flex justify-start mt-2">
        {isEditing && (
          <div>
            <button
              onClick={() => {
                onSave(type, id);
                setEditingId(null);
              }}
              className="border border-black px-2 py-1 rounded hover:bg-blue-200 hover:cursor-pointer"
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
