import React, { useState, useEffect } from "react";
import SubItem from "./SubItem";
import { isDirector, isPM, isIT, isAP } from "@/app/constants/roles";
import { useSession } from "next-auth/react";

export default function SubSection({
  type,
  items,
  fields,
  label,
  onChange,
  onSave,
  search,
  onContactChange,
  renderContent,
  onAdd,
  onDelete,
}) {
  const [editingIdx, setEditingIdx] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { data: session } = useSession();

  const handleSaveWrapper = async (type, idx) => {
    await onSave(type, idx);
    setEditingIdx(null);
  };

  // auto expand if search matches, close if nothing in search bar
  useEffect(() => {
    if ((search && items && items.length > 0) || editingIdx !== null) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [search, items, editingIdx]);

  return (
    <>
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
          {renderContent ? (
            renderContent()
          ) : items && items.length > 0 ? (
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
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="text-gray-500">
              No {label.toLowerCase()} listed.
            </div>
          )}
          {(isDirector(session) ||
            isPM(session) ||
            isIT(session) ||
            isAP(session)) && (
            <div className="flex justify-start">
              <button
                className="mt-2 text-xs text-green-700 border border-green-700 px-2 py-1 rounded hover:bg-green-50 hover:cursor-pointer inline-block"
                type="button"
                onClick={() => {
                  onAdd(type);
                  setEditingIdx(items?.length || 0);
                }}
              >
                + Add {label.slice(0, -1)}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
