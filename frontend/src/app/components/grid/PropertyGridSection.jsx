import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AddIcon } from "./GridCells";
import RichTextCellEditor from "./RichTextCellEditor";

export default function PropertyGridSection({
  title,
  columns,
  rows,
  onAddRow,
  onDeleteRows,
  onCellValueChanged,
}) {
  const gridRef = useRef(null);

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

  const defaultColDef = useMemo(
    () => ({
      editable: true,
      resizable: true,
      sortable: true,
      filter: true,
      cellEditor: RichTextCellEditor,
      cellEditorPopup: true,
      cellEditorPopupPosition: "over",
      cellRenderer: (params) =>
      params.value ? (
        <div dangerouslySetInnerHTML={{ __html: params.value }} />
      ) : "",
      width: 600,
      minWidth: 160,
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
    const handle = () => gridRef.current?.api?.sizeColumnsToFit();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return (
    <div className="mt-2 flex flex-col">
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
        </div>
      </div>

      <div className="ag-theme-alpine w-full" style={{height: 300}}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columns}
          rowData={rows}
          defaultColDef={defaultColDef}
          rowSelection="multiple"
          undoRedoCellEditing
          singleClickEdit
          stopEditingWhenCellsLoseFocus={true}
          enterNavigatesVertically={true}
          enterNavigatesVerticallyAfterEdit={true}
          animateRows
          domLayout="normal"
          rowHeight={48}
          getRowId={getRowId}
          deltaRowDataMode={true}
          popupParent={popupParent}
          onColumnHeaderDoubleClicked={onHeaderCellDblClicked}
          onCellValueChanged={onCellValueChanged}
        />
      </div>
    </div>
  );
}
