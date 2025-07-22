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

export default function ContactsCell(props) {
  // AG Grid passes the row data as props.data or props.node.data
  const contacts = props.data?.contacts || [];
  const parentId =
    props.data?.suite_id || props.data?.service_id || props.data?.utility_id;
  const parentType = props.data?.suite_id
    ? "suite"
    : props.data?.service_id
    ? "service"
    : props.data?.utility_id
    ? "utility"
    : null;

  const [modalContact, setModalContact] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const addContactMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/contacts", payload),
    onError: () => alert("Failed to save contact."),
  });

  const editContactMutation = useMutation({
    mutationFn: (payload) =>
      axiosInstance.put(`/contacts/${payload.contact_id}`, payload),
    onError: () => alert("Failed to save contact."),
  });

  const handleContactSave = async (contact, isNew) => {
    const payload = {
      ...contact,
      [`${parentType}_id`]: parentId,
    };
    if (isNew) {
      await addContactMutation.mutateAsync(payload);
    } else {
      await editContactMutation.mutateAsync(payload);
    }
    setModalContact(null);
    setEditMode(false);
    if (props.api && props.api.refreshCells) {
      props.api.refreshCells();
    }
  };

  return (
    <div>
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <button
            key={contact.contact_id}
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setModalContact(contact);
              setEditMode(false);
            }}
            type="button"
          >
            {contact.name}
          </button>
        ))
      ) : (
        <span></span>
      )}
      <button
        className="mt-2 ml-2 text-xs text-green-700 border border-green-700 px-2 py-1 rounded hover:bg-green-50 hover:cursor-pointer"
        onClick={() => {
          setModalContact(emptyContact);
          setEditMode(true);
        }}
        type="button"
      >
        + Add Contact
      </button>
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
