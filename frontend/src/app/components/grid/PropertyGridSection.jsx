import React, { useRef, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { AddIcon } from "./GridCells";

export default function PropertyGridSection({
  title,
  columns,
  rows,
  onAddRow,
  onDeleteRows,            
  onCellValueChanged,
  pinnedLeftField,        
}) {
  const gridRef = useRef(null);

  const defaultColDef = {
    editable: true,
    resizable: true,
    sortable: true,
    filter: true,
    minWidth: 120,
  };

  const colDefs = pinnedLeftField
    ? columns.map((c, i) =>
        i === 0 || c.field === pinnedLeftField ? { ...c, pinned: "left" } : c
      )
    : columns;

  const onGridReady = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const onHeaderCellDblClicked = useCallback((params) => {
    const col = params.column;
    params.api.autoSizeColumns([col.getColId()]);
  }, []);

  useEffect(() => {
    const handle = () => gridRef.current?.api?.sizeColumnsToFit();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold mt-6 mb-2">{title}</h3>
        <div className="flex items-center gap-2 mt-6 mb-2">
          {onAddRow && <AddIcon onClick={onAddRow} />}
          {onDeleteRows && (
            <button
              className="text-red-700 border border-red-700 px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
              type="button"
              onClick={() => {
                const selected = gridRef.current?.api?.getSelectedRows() || [];
                if (selected.length) onDeleteRows(selected);
              }}
            >
              Delete Selected
            </button>
          )}
          <button
            className="border px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
            type="button"
            onClick={() => gridRef.current?.api?.sizeColumnsToFit()}
          >
            Fit Columns
          </button>
        </div>
      </div>

      <div className="ag-theme-alpine w-full">
        <AgGridReact
          ref={gridRef}
          columnDefs={colDefs}
          rowData={rows}
          defaultColDef={defaultColDef}
          rowSelection="multiple"

          undoRedoCellEditing
          singleClickEdit
          enterNavigatesVertically
          enterNavigatesVerticallyAfterEdit
          animateRows
          domLayout="autoHeight"
          onGridReady={onGridReady}
          onColumnHeaderDoubleClicked={onHeaderCellDblClicked}
          onCellValueChanged={onCellValueChanged}
          // keep virtualization ON by not setting suppressColumnVirtualisation
          // allow horizontal scroll if needed (no suppressHorizontalScroll)
        />
      </div>
    </div>
  );
}
