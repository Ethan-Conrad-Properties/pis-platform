import React, {
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { AddIcon } from "./GridCells";
import { useSession } from "next-auth/react";
import { isDirector, isPM, isAP, isIT } from "@/app/constants/roles";

export default function PropertyGridSection({
  title,
  columns,
  rows,
  onAddRow,
  onDeleteRows,
  onCellValueChanged,
  search,
  autoExpand,
}) {
  const gridRef = useRef(null);
  const [collapsed, setCollapsed] = useState(true); // collapsed by default
  const { data: session } = useSession();

  // ✅ Only these roles can edit
  const canEdit =
    isDirector(session) || isPM(session) || isAP(session) || isIT(session);

  const getRowId = useCallback(
    (params) =>
      String(
        params.data.yardi ??
          params.data.suite_id ??
          params.data.service_id ??
          params.data.utility_id ??
          params.data.code_id
      ),
    []
  );

  // ✅ Force all incoming columns to respect `canEdit`
  const enforcedColDefs = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        editable: canEdit, // override any per-column setting
      })),
    [columns, canEdit]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      cellEditor: "agLargeTextCellEditor",
      cellEditorPopup: true,
      minWidth: 160,
      flex: 1,
      wrapText: true,
      autoHeight: true,
    }),
    []
  );

  const onHeaderCellDblClicked = useCallback((params) => {
    const col = params.column;
    params.api.autoSizeColumns([col.getColId()]);
  }, []);

  const popupParent = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  useEffect(() => {
    if (!collapsed && gridRef.current?.api) {
      // run after next paint to ensure grid is ready
      setTimeout(() => {
        gridRef.current?.api?.sizeColumnsToFit();
        gridRef.current?.api?.resetRowHeights();
      }, 0);
    }
  }, [collapsed, rows]);

  useEffect(() => {
    if (search && rows && rows.length > 0 && autoExpand) {
      setCollapsed(false);
      // scroll first match into view
      setTimeout(() => {
        if (gridRef.current?.api && rows.length > 0) {
          gridRef.current.api.ensureIndexVisible(0, "top");
        }
      }, 0);
    }
  }, [search, rows, autoExpand]);

  return (
    <div className="mt-2 flex flex-col border rounded">
      {/* Section Header */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-100 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-gray-600">
          {collapsed ? "➕ Expand" : "➖ Collapse"}
        </span>
      </div>

      {/* Section Content */}
      {!collapsed && (
        <div className="p-2">
          {/* Right-aligned Add/Delete */}
          <div className="flex items-center justify-end mb-2 gap-2">
            {canEdit && onAddRow && <AddIcon onClick={onAddRow} />}
            {canEdit && onDeleteRows && (
              <button
                className="text-red-700 border border-red-700 px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
                type="button"
                onClick={() => {
                  const selected =
                    gridRef.current?.api?.getSelectedRows() || [];
                  if (selected.length) onDeleteRows(selected);
                }}
              >
                Delete Selected
              </button>
            )}
          </div>

          {/* Grid - auto expands vertically, no internal scroll */}
          <div className="ag-theme-alpine w-full">
            <AgGridReact
              ref={gridRef}
              columnDefs={enforcedColDefs}
              rowData={rows}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              undoRedoCellEditing
              singleClickEdit
              stopEditingWhenCellsLoseFocus={true}
              enterNavigatesVertically={true}
              enterNavigatesVerticallyAfterEdit={true}
              animateRows
              domLayout="autoHeight"
              getRowId={getRowId}
              deltaRowDataMode={true}
              popupParent={popupParent}
              onColumnHeaderDoubleClicked={onHeaderCellDblClicked}
              onCellValueChanged={canEdit ? onCellValueChanged : undefined} // block edits from firing
            />
          </div>
        </div>
      )}
    </div>
  );
}
