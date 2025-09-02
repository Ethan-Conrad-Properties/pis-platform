import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useMutation } from "@tanstack/react-query";
import ContactInfoModal from "../common/ContactInfoModal";
import axiosInstance from "@/app/utils/axiosInstance";

const emptyContact = {
  contact_id: undefined,
  name: "",
  office_number: "",
  cell_number: "",
  email: "",
};

// -------------------------------------------------------------------
// ContactsCell
// AG Grid cell renderer for displaying + managing contacts
// tied to a suite, service, or utility.
// - Lists contacts vertically inside the grid cell.
// - Each contact opens an edit modal when clicked.
// - Includes a "+ Add Contact" button at the bottom.
// - Uses React Query mutations for API calls.
// - Props (from AG Grid):
//   • data: row data (must contain contacts + suite_id/service_id/utility_id).
//   • api: AG Grid API (used here to refresh cells after edits).
// -------------------------------------------------------------------

export default function ContactsCell(props) {
  const contacts = props.data?.contacts || [];

  // Determine parent entity type (suite/service/utility)
  const parentId =
    props.data?.suite_id || props.data?.service_id || props.data?.utility_id;
  const parentType = props.data?.suite_id
    ? "suite"
    : props.data?.service_id
    ? "service"
    : props.data?.utility_id
    ? "utility"
    : null;

  const [modalContact, setModalContact] = useState(null); // contact currently being edited/viewed
  const [editMode, setEditMode] = useState(false); // edit vs. view mode

  // Mutation → Add new contact
  const addContactMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/contacts", payload),
    onError: () => alert("Failed to save contact."),
  });

  // Mutation → Edit existing contact
  const editContactMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/contacts/${payload.contact_id}`, payload),
    onError: () => alert("Failed to save contact."),
  });

  // Save handler: decides whether to add or edit
  const handleContactSave = async (contact, isNew) => {
    const payload = {
      ...contact,
      [`${parentType}_id`]: parentId, // link contact to correct parent
    };

    if (isNew) {
      await addContactMutation.mutateAsync(payload);
    } else {
      await editContactMutation.mutateAsync(payload);
    }

    // Close modal + refresh grid
    setModalContact(null);
    setEditMode(false);
    props.api?.refreshCells?.();
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Existing contacts listed */}
      {contacts.map((contact) => (
        <button
          key={contact.contact_id}
          className="text-left hover:underline hover:cursor-pointer"
          onClick={() => {
            setModalContact(contact);
            setEditMode(true);
          }}
          type="button"
        >
          {contact.name}
        </button>
      ))}

      {/* Add new contact button */}
      <button
        className="w-fit my-1 text-xs text-green-700 border border-green-700 px-2 py-1 rounded hover:bg-green-50 hover:cursor-pointer"
        onClick={() => {
          setModalContact(emptyContact);
          setEditMode(true);
        }}
        type="button"
      >
        + Add Contact
      </button>

      {/* Modal for editing/adding */}
      {modalContact &&
        createPortal(
          <ContactInfoModal
            contact={modalContact}
            onClose={() => setModalContact(null)}
            isEdit={editMode}
            onContactSave={handleContactSave}
          />,
          document.body
        )}
    </div>
  );
}
