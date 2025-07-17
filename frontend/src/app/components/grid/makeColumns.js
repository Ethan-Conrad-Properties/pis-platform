import { ExpandingCell } from "./GridCells";

export function makeColumns(columns) {
  return columns.map(col => ({
    field: col.key,
    headerName: col.name,
    editable: true,
    cellRenderer: ExpandingCell,
    autoHeight: true,
    wrapText: true,
    resizable: true,
    flex: 1,
    headerStyle: {
      backgroundColor: "#b2e3f5",
    },
    cellStyle: {
      backgroundColor: "#f2f4f5",
      borderRight: "1px solid #d1d5db"
    },
  }));
}