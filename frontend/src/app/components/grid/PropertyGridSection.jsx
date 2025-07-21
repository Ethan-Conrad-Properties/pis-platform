import React from "react";
import { AgGridReact } from "ag-grid-react";
import { AddIcon } from "./GridCells";

export default function PropertyGridSection({
  title,
  columns,
  rows,
  onAddRow,
  onCellValueChanged
}) {
  return (
    <div className="mt-2">
      <div className="flex items-center">
        <h3 className="text-2xl font-semibold mt-6 mb-2">{title}</h3>
      </div>
      <div
        className="ag-theme-alpine w-full overflow-x-auto"
        style={{
          minWidth: 0,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ minWidth: 600 }}>
          <AgGridReact
            columnDefs={columns}
            rowData={rows}
            domLayout="autoHeight"
            onCellValueChanged={onCellValueChanged}
            suppressHorizontalScroll
            suppressColumnVirtualisation
          />
        </div>
      </div>
      <div className="text-left mt-2">
        {onAddRow && <AddIcon onClick={onAddRow} />}
      </div>
    </div>
  )
}