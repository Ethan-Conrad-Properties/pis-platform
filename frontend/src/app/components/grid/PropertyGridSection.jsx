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
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import RichTextCellEditor from "./RichTextCellEditor";
import "ag-grid-community/styles/ag-theme-balham.css";

// Register AG Grid modules (required for grid functionality)
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * PropertyGridSection
 * --------------------
 * Renders a collapsible AG Grid section for one entity type
 * (Suites, Services, Utilities, Codes, etc.) inside a property card.
 *
 * Features:
 *  - Collapsible container with title
 *  - Row reordering with drag + localStorage persistence
 *  - Column resizing, visibility, and ordering persistence
 *  - Inline cell editing with RichTextCellEditor
 *  - Role-based permissions (edit/add/delete restricted by user role)
 *  - Auto-expand when a search query matches
 *  - Delete selected rows + add new row button
 *
 * Props:
 *  - title: string → header shown at top
 *  - yardi: string → property ID (used for localStorage keys)
 *  - columns: array → column definitions
 *  - rows: array → data rows for this section
 *  - onAddRow: fn → called when +Add clicked
 *  - onDeleteRows: fn → called with array of selected rows to delete
 *  - onCellValueChanged: fn → callback when a cell is edited
 *  - search: string → triggers auto-expand if matches
 *  - autoExpand: boolean → whether to expand on search
 */
export default function PropertyGridSection({
  title,
  yardi,
  columns,
  rows,
  onAddRow,
  onDeleteRows,
  onCellValueChanged,
  search,
  autoExpand,
}) {
  const gridRef = useRef(null);
  const [collapsed, setCollapsed] = useState(true);
  const [rowData, setRowData] = useState(rows);
  const { data: session } = useSession();

  // ✅ Only directors, PMs, APs, and IT can edit
  const canEdit =
    isDirector(session) || isPM(session) || isAP(session) || isIT(session);

  // LocalStorage keys for persistence
  const rowOrderKey = `${yardi}-${title}-rowOrder`;
  const colStateKey = `${yardi}-${title}-colState`;

  // Unique row ID selector (used by AG Grid + persistence)
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

  // Column definitions with enforced behavior
  const enforcedColDefs = useMemo(
    () =>
      columns.map((col) => {
        if (col.field !== "contacts") {
          return {
            ...col,
            editable: canEdit,
            cellEditor: RichTextCellEditor,
            rowDrag: true, // allow row reordering
          };
        }
        return { ...col, editable: canEdit };
      }),
    [columns, canEdit]
  );

  // Default column behavior (applied globally)
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      minWidth: 160,
      flex: 1,
      wrapText: true,
      autoHeight: true,
      editable: true,
      cellEditor: "agLargeTextCellEditor", // fallback for text cells
      cellEditorPopup: true,
    }),
    []
  );

  // 🔄 Restore row order from localStorage
  useEffect(() => {
    if (!rows) return;
    const saved = localStorage.getItem(rowOrderKey);
    if (saved) {
      try {
        const rowOrder = JSON.parse(saved);
        const ordered = rowOrder
          .map((id) => rows.find((r) => getRowId({ data: r }) === id))
          .filter(Boolean);
        const leftovers = rows.filter(
          (r) => !rowOrder.includes(getRowId({ data: r }))
        );
        setRowData([...ordered, ...leftovers]);
        return;
      } catch {
        console.warn("Bad row order in storage");
      }
    }
    setRowData(rows);
  }, [rows, rowOrderKey, getRowId]);

  // 💾 Save row order when drag ends
  const onRowDragEnd = useCallback(() => {
    if (!gridRef.current?.api) return;
    const allNodes = [];
    gridRef.current.api.forEachNode((node) => allNodes.push(node));
    setRowData(allNodes.map((n) => n.data));

    const rowOrder = allNodes.map((n) => getRowId(n));
    localStorage.setItem(rowOrderKey, JSON.stringify(rowOrder));
  }, [rowOrderKey, getRowId]);

  // 🔄 Restore column state from localStorage
  const restoreColState = useCallback(() => {
    if (!gridRef.current?.api) return;
    const saved = localStorage.getItem(colStateKey);
    if (saved) {
      try {
        const colState = JSON.parse(saved);
        gridRef.current.api.applyColumnState({
          state: colState,
          applyOrder: true,
        });
      } catch {
        console.warn("Bad col state in storage");
      }
    }
  }, [colStateKey]);

  // 💾 Save column state changes
  const saveColState = useCallback(() => {
    if (!gridRef.current?.api) return;
    const colState = gridRef.current.api.getColumnState();
    localStorage.setItem(colStateKey, JSON.stringify(colState));
  }, [colStateKey]);

  // 🔍 Auto-expand when search is active
  useEffect(() => {
    if (search && rows && rows.length > 0 && autoExpand) {
      setCollapsed(false);
      setTimeout(() => {
        if (gridRef.current?.api && rows.length > 0) {
          gridRef.current.api.ensureIndexVisible(0, "top");
        }
      }, 0);
    }
  }, [search, rows, autoExpand]);

  return (
    <div className="mt-2 flex flex-col border rounded">
      {/* Header (collapsible) */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-100 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
        style={{
          background: "var(--surface)",
          color: "var(--surface-foreground)",
        }}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-gray-600">
          {collapsed ? "➕ Expand" : "➖ Collapse"}
        </span>
      </div>

      {/* Grid body */}
      {!collapsed && (
        <div className="p-2">
          {/* Toolbar */}
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

          {/* AG Grid */}
          <div className="w-full ag-theme-balham">
            <AgGridReact
              ref={gridRef}
              columnDefs={enforcedColDefs}
              rowData={rowData}
              defaultColDef={defaultColDef}
              rowDragManaged={true}
              animateRows={true}
              rowSelection={{ mode: "multiRow" }}
              stopEditingWhenCellsLoseFocus={false}
              enterNavigatesVertically={true}
              enterNavigatesVerticallyAfterEdit={true}
              domLayout="autoHeight"
              getRowId={getRowId}
              popupParent={
                typeof document !== "undefined" ? document.body : null
              }
              onCellValueChanged={(params) => {
                console.log("✅ Cell updated:", {
                  colId: params.colDef.field,
                  oldValue: params.oldValue,
                  newValue: params.newValue,
                });
                if (canEdit && onCellValueChanged) {
                  onCellValueChanged(params);
                }
              }}
              onRowDragEnd={onRowDragEnd}
              onGridReady={restoreColState}
              onColumnMoved={saveColState}
              onColumnResized={saveColState}
              onColumnVisible={saveColState}
              onColumnPinned={saveColState}
            />
          </div>
        </div>
      )}
    </div>
  );
}
