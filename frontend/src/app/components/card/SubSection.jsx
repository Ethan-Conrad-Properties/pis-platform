import React, { useState, useEffect } from "react";
import SuccessModal from "../common/SuccessModal";
import SubItem from "./SubItem";

export default function SubSection({
  type,
  items,
  fields,
  label,
  onChange,
  onSave,
  search,
  onContactChange,
}) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSaveWrapper = async (type, idx) => {
    await onSave(type, idx);
    setEditingIdx(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // auto expand if search matches, close if nothing in search bar
  useEffect(() => {
    if ((search && items && items.length > 0) || editingIdx !== null) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [search, items]);

  return (
    <>
      <SuccessModal open={showModal} onClose={handleCloseModal} />
      <div className="flex items-center mt-4 mb-2">
        <h3 className="text-lg font-bold">{label}</h3>
        <button
          className="font-bold ml-1 text-sm"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? ` ▲` : `▼`}
        </button>
      </div>
      {expanded && (
        <div className="grid grid-cols-1 gap-4">
          {items && items.length > 0 ? (
            items.map((item, idx) => (
              <SubItem
                key={
                  item.suite_id ||
                  item.service_id ||
                  item.utility_id ||
                  item.code_id ||
                  idx
                }
                item={item}
                idx={idx}
                type={type}
                fields={fields}
                isEditing={editingIdx === idx}
                onChange={onChange}
                onSave={handleSaveWrapper}
                setEditingIdx={setEditingIdx}
                onContactChange={onContactChange}
              />
            ))
          ) : (
            <div className="text-gray-500">
              No {label.toLowerCase()} listed.
            </div>
          )}
        </div>
      )}
    </>
  );
}
