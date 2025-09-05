import React, { useState, useEffect } from "react";
import SubItem from "./SubItem";
import { isDirector, isPM, isIT, isAP } from "@/app/constants/roles";
import { useSession } from "next-auth/react";

/**
 * SubSection
 *
 * Reusable wrapper for rendering a collapsible section of sub-entities
 * (Suites, Services, Utilities, Codes, Photos, etc.).
 *
 * Responsibilities:
 * - Displays a header with expand/collapse toggle.
 * - Maps and renders each `SubItem` (or `renderContent` if provided).
 * - Handles inline editing state (only one sub-item editable at a time).
 * - Expands automatically when search is active or an item is being edited.
 * - Shows "Add" button if user has sufficient role permissions.
 *
 * Props:
 * - type: string (e.g., "suites" | "services" | "utilities" | "codes")
 * - items: array of entity objects to render
 * - fields: array of {id, label} for configuring SubItem fields
 * - label: string — section heading (plural form like "Suites")
 * - onChange: (type, idx, field, value) → field change handler
 * - onSave: (type, idx) → save handler
 * - search: string — search query, used to auto-expand if results exist
 * - onContactChange: (type, idx, contact, action) → contact CRUD handler
 * - renderContent: optional custom renderer (e.g., for Photos section)
 * - onAdd: (type) → called when adding a new sub-entity
 * - onDelete: (type, idx) → delete handler
 */
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
  const [editingIdx, setEditingIdx] = useState(null); // track which row is being edited
  const [expanded, setExpanded] = useState(false); // expand/collapse state
  const { data: session } = useSession();

  /**
   * Wraps onSave to automatically clear editing index after saving.
   */
  const handleSaveWrapper = async (type, idx) => {
    await onSave(type, idx);
    setEditingIdx(null);
  };

  /**
   * Expand section if:
   * - user is searching and there are items, OR
   * - a row is being edited.
   * Collapse if no search and nothing being edited.
   */
  useEffect(() => {
    if ((search && items && items.length > 0) || editingIdx !== null) {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [search, items, editingIdx]);

  return (
    <>
      {/* Section header with expand/collapse toggle */}
      <div className="flex items-center mt-4 mb-2">
        <h3
          className="text-lg font-bold cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
        >
          {label}
        </h3>
        <button
          className="font-bold ml-1 text-sm cursor-pointer"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? ` ▲` : `▼`}
        </button>
      </div>

      {/* Section content */}
      {expanded && (
        <div className="grid grid-cols-1 gap-4">
          {/* If custom renderContent is passed, use it (e.g., for Photos) */}
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

          {/* Add button (restricted by role) */}
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
                  setEditingIdx(items?.length || 0); // auto-edit newly added row
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
