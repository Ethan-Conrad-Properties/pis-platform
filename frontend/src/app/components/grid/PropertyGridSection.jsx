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

ModuleRegistry.registerModules([AllCommunityModule]);

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

  const canEdit =
    isDirector(session) || isPM(session) || isAP(session) || isIT(session);

  const rowOrderKey = `${yardi}-${title}-rowOrder`;

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

  // restore row order
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

  // save row order
  const onRowDragEnd = useCallback(() => {
    if (!gridRef.current?.api) return;
    const allNodes = [];
    gridRef.current.api.forEachNode((node) => allNodes.push(node));
    setRowData(allNodes.map((n) => n.data));

    const rowOrder = allNodes.map((n) => getRowId(n));
    localStorage.setItem(rowOrderKey, JSON.stringify(rowOrder));
  }, [rowOrderKey, getRowId]);

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
              rowSelection={{ mode: "multiRow" }}
              singleClickEdit
              stopEditingWhenCellsLoseFocus={true}
              enterNavigatesVertically={true}
              enterNavigatesVerticallyAfterEdit={true}
              domLayout="autoHeight"
              getRowId={getRowId}
              popupParent={popupParent}
              onCellValueChanged={canEdit ? onCellValueChanged : undefined}
              onRowDragEnd={onRowDragEnd}
            />
          </div>
        </div>
      )}
    </div>
  );
}
