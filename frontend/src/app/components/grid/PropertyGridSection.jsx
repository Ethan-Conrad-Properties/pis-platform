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
  const [collapsed, setCollapsed] = useState(true);
  const [rowData, setRowData] = useState(rows);
  const { data: session } = useSession();

  const canEdit =
    isDirector(session) || isPM(session) || isAP(session) || isIT(session);

  const storageKey = `${title}-gridState`;

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

  // enforce editability per role
  const enforcedColDefs = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        editable: canEdit,
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
      rowDrag: true,
    }),
    []
  );

  const onHeaderCellDblClicked = useCallback((params) => {
    params.api.autoSizeColumns([params.column.getColId()]);
  }, []);

  // restore row order whenever rows change
  useEffect(() => {
    if (!rows) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { rowOrder } = JSON.parse(saved);
        if (rowOrder) {
          const ordered = rowOrder
            .map((id) => rows.find((r) => getRowId({ data: r }) === id))
            .filter(Boolean);
          const leftovers = rows.filter(
            (r) => !rowOrder.includes(getRowId({ data: r }))
          );
          setRowData([...ordered, ...leftovers]);
          return;
        }
      } catch {
        console.warn("Bad grid state in storage");
      }
    }

    setRowData(rows);
  }, [rows, storageKey, getRowId]);

  // restore column state
  const restoreColumnState = useCallback(() => {
    if (!gridRef.current?.columnApi) return;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const { columnState } = JSON.parse(saved);
      if (columnState && columnState.length) {
        gridRef.current.columnApi.applyColumnState({
          state: columnState,
          applyOrder: true,
        });
      }
    } catch {
      console.warn("Bad column state in storage");
    }
  }, [storageKey]);

  // save row order
  const onRowDragEnd = useCallback(() => {
    if (!gridRef.current?.api) return;
    const allNodes = [];
    gridRef.current.api.forEachNode((node) => allNodes.push(node));
    const newData = allNodes.map((n) => n.data);
    setRowData(newData);

    const rowOrder = allNodes.map((n) => getRowId(n));
    const existing = JSON.parse(localStorage.getItem(storageKey) || "{}");
    localStorage.setItem(storageKey, JSON.stringify({ ...existing, rowOrder }));
  }, [storageKey, getRowId]);

  // save column state
  const saveColumnState = useCallback(() => {
    if (!gridRef.current?.columnApi) return;
    const state = gridRef.current.columnApi.getColumnState();
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
        columnState: state,
      })
    );
  }, [storageKey]);

  const popupParent = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  // auto expand on search
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

  // resize to fit when opened
  useEffect(() => {
    if (!collapsed && gridRef.current?.api) {
      setTimeout(() => {
        gridRef.current.api.sizeColumnsToFit();
        gridRef.current.api.resetRowHeights();
      }, 0);
    }
  }, [collapsed, rowData]);

  return (
    <div className="mt-2 flex flex-col border rounded">
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-100 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-gray-600">
          {collapsed ? "➕ Expand" : "➖ Collapse"}
        </span>
      </div>

      {!collapsed && (
        <div className="p-2">
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

          <div className="ag-theme-alpine w-full">
            <AgGridReact
              ref={gridRef}
              columnDefs={enforcedColDefs}
              rowData={rowData}
              defaultColDef={defaultColDef}
              rowDragManaged={true}
              animateRows={true}
              rowSelection="multiple"
              undoRedoCellEditing
              singleClickEdit
              stopEditingWhenCellsLoseFocus={true}
              enterNavigatesVertically={true}
              enterNavigatesVerticallyAfterEdit={true}
              domLayout="autoHeight"
              getRowId={getRowId}
              deltaRowDataMode={true}
              popupParent={popupParent}
              onColumnHeaderDoubleClicked={onHeaderCellDblClicked}
              onCellValueChanged={canEdit ? onCellValueChanged : undefined}
              onRowDragEnd={onRowDragEnd}
              onFirstDataRendered={() => {
                restoreColumnState();
                gridRef.current.api.sizeColumnsToFit();
              }}
              onColumnMoved={saveColumnState}
              onColumnResized={saveColumnState}
              onColumnPinned={saveColumnState}
              onColumnVisible={saveColumnState}
            />
          </div>
        </div>
      )}
    </div>
  );
}
