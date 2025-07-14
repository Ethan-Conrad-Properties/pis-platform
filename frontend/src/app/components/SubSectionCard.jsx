import React, { useState, useRef, useEffect } from "react";
import SuccessModal from "./SuccessModal";

function AutoExpandTextarea({ value, onChange, ...props }) {
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

const SubItem = React.memo(function SubItem({
  item,
  idx,
  type,
  fields,
  isEditing,
  onChange,
  onSave,
  setEditingIdx
}) {
  const uniqueKey = item.suite_id || item.service_id || item.utility_id || item.code_id;
  return (
    <div
      key={uniqueKey}
      className="flex flex-col border rounded-lg p-4 shadow-sm bg-gray-50 relative"
    >
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
        {fields.map(field => (
          <div key={field.id} className="mb-2 text-sm">
            <label className="font-semibold">{field.label}:</label>{" "}
            {isEditing ? (
              <AutoExpandTextarea
                value={item[field.id] ?? ""}
                onChange={e => onChange(type, idx, field.id, e.target.value)}
              />
            ) : (
              <span>{item[field.id]}</span>
            )}
          </div>
        ))}
      </div>
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

export default function SubSectionCard({ type, items, fields, label, onChange, onSave }) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSaveWrapper = async (type, idx) => {
    await onSave(type, idx);
    setEditingIdx(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <SuccessModal open={showModal} onClose={handleCloseModal} />
      <h3 className="text-lg font-bold mt-4 mb-2">{label}</h3>
      <div className="grid grid-cols-1 gap-4">
        {items && items.length > 0 ? items.map((item, idx) => (
          <SubItem
            key={item.suite_id || item.service_id || item.utility_id || item.code_id}
            item={item}
            idx={idx}
            type={type}
            fields={fields}
            isEditing={editingIdx === idx}
            onChange={onChange}
            onSave={handleSaveWrapper}
            setEditingIdx={setEditingIdx}
          />
        )) : (
          <div className="text-gray-500">No {label.toLowerCase()} listed.</div>
        )}
      </div>
    </>
  );
}