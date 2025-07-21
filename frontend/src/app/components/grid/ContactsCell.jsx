import React, { useState } from "react";
import { createPortal } from "react-dom";
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
  const parentId = props.data?.suite_id || props.data?.service_id || props.data?.utility_id;
  const parentType = props.data?.suite_id
    ? "suite"
    : props.data?.service_id
    ? "service"
    : props.data?.utility_id
    ? "utility"
    : null;

  const [modalContact, setModalContact] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Save handler for modal
  const handleContactSave = async (contact, isNew) => {
    try {
      if (isNew) {
        await axiosInstance.post("/contacts", {
          ...contact,
          [`${parentType}_id`]: parentId,
        });
      } else {
        await axiosInstance.put(`/contacts/${contact.contact_id}`, contact);
      }
      setModalContact(null);
      setEditMode(false);
      // trigger grid refresh
      if (props.api && props.api.refreshCells) {
        props.api.refreshCells();
      }
    } catch (error) {
      alert("Failed to save contact.");
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
        className="mt-2 text-xs text-green-700 border border-green-700 px-2 py-1 rounded hover:bg-green-50 hover:cursor-pointer"
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