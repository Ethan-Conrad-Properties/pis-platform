import { ExpandingCell } from "./GridCells";
import ContactsCell from "./ContactsCell";

// -------------------------------------------------------------------
// makeColumns
// Utility to transform a list of column definitions into
// AG Grid column configs with consistent styling/behavior.
// - Wraps default props: editable, resizing, text wrapping, styling.
// - Special cases:
//   • "contacts" → renders with ContactsCell (custom modal logic).
//   • All other fields → renders with ExpandingCell (truncated text).
// - Params:
//   • columns: array → list of { key, name } objects (from column configs).
// - Returns: array of AG Grid column definition objects.
// -------------------------------------------------------------------
export function makeColumns(columns) {
  return columns.map((col) => ({
    field: col.key, // maps to object field
    headerName: col.name, // header label
    editable: col.key !== "contacts", // disable editing on contacts
    cellRenderer: col.key === "contacts" ? ContactsCell : ExpandingCell,
    autoHeight: true, // adjust row height to fit wrapped text
    wrapText: true, // allow long text to wrap
    resizable: true, // allow column resizing
    flex: 1, // flexible width
    headerStyle: {
      backgroundColor: "#b2e3f5", // light blue headers
    },
    cellStyle: {
      backgroundColor: "#f2f4f5", // light gray cells
      borderRight: "1px solid #d1d5db", // column separator
    },
  }));
}
