import * as XLSX from "xlsx";

// -------------------------------------------------------------------
// General Utility Functions
// Used across frontend for formatting, searching, sorting, exporting.
// -------------------------------------------------------------------

/**
 * Format a date string (YYYY-MM-DD) into MM/DD/YYYY.
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Split an array into chunks of given size.
 */
export function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Filter items by search term.
 * getFields: function that returns an array of searchable fields for each item.
 */
export function filterBySearch(items, getFields, search) {
  const lower = search.toLowerCase();
  return items.filter((item) =>
    getFields(item).some((field) =>
      String(field || "").toLowerCase().includes(lower)
    )
  );
}

/**
 * Paginate an array manually.
 */
export function paginate(array, currentPage, itemsPerPage) {
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  return array.slice(indexOfFirst, indexOfLast);
}

/**
 * Get total number of pages for pagination.
 */
export function getTotalPages(array, itemsPerPage) {
  return Math.ceil(array.length / itemsPerPage);
}

/**
 * Sort an array of objects by a given key (alphabetically).
 */
export function sort(properties, key) {
  return [...properties].sort((a, b) => {
    const aValue = a[key] || "";
    const bValue = b[key] || "";
    return aValue.localeCompare(bValue);
  });
}

/**
 * Helper: Remove unwanted keys from array of objects.
 */
function omitKeys(arr, keysToOmit) {
  return arr.map((obj) => {
    const newObj = { ...obj };
    keysToOmit.forEach((key) => delete newObj[key]);
    return newObj;
  });
}

/**
 * Export a full property (with nested suites, services, etc.)
 * into an Excel workbook (.xlsx).
 */
export function exportProperty(property) {
  if (!property) return;

  // Split out nested arrays
  const { suites, services, utilities, codes, ...main } = property;
  const mainSheet = XLSX.utils.json_to_sheet([main]);

  // Keys to omit before export
  const suiteOmit = ["property_yardi", "suite_id"];
  const serviceOmit = ["property_yardi", "service_id"];
  const utilityOmit = ["property_yardi", "utility_id"];
  const codeOmit = ["property_yardi", "code_id"];

  // Helper: remove keys + flatten contacts into readable strings
  function omitAndAddContacts(arr, keysToOmit) {
    return arr.map((obj) => {
      const newObj = { ...obj };
      keysToOmit.forEach((key) => delete newObj[key]);

      newObj.contacts =
        obj.contacts && obj.contacts.length
          ? obj.contacts
              .map((c) => {
                const office = c.office_number || "";
                const cell = c.cell_number || "";
                const phone = office || cell || c.phone || "";
                return `${c.name}${c.title ? ", " + c.title : ""} (${phone}${
                  phone && c.email ? ", " : ""
                }${c.email || ""})`;
              })
              .join("\n")
          : "";
      return newObj;
    });
  }

  // Build Excel sheets
  const suitesSheet = XLSX.utils.json_to_sheet(
    suites && suites.length ? omitAndAddContacts(suites, suiteOmit) : [{}]
  );
  const servicesSheet = XLSX.utils.json_to_sheet(
    services && services.length ? omitAndAddContacts(services, serviceOmit) : [{}]
  );
  const utilitiesSheet = XLSX.utils.json_to_sheet(
    utilities && utilities.length ? omitAndAddContacts(utilities, utilityOmit) : [{}]
  );
  const codesSheet = XLSX.utils.json_to_sheet(
    codes && codes.length ? omitKeys(codes, codeOmit) : [{}]
  );

  // Build workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, mainSheet, "Property");
  XLSX.utils.book_append_sheet(workbook, suitesSheet, "Suites");
  XLSX.utils.book_append_sheet(workbook, servicesSheet, "Services");
  XLSX.utils.book_append_sheet(workbook, utilitiesSheet, "Utilities");
  XLSX.utils.book_append_sheet(workbook, codesSheet, "Codes");

  // Save file
  const fileName = `${property.address || property.yardi || "property"}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Restore user-custom row order from localStorage (if exists).
 * Falls back to default order if none saved.
 */
export function reorderFromStorage(yardi, title, items = [], getRowId) {
  if (!items || items.length === 0) return [];

  const rowOrderKey = `${yardi}-${title}-rowOrder`;

  try {
    const saved = localStorage.getItem(rowOrderKey);
    if (!saved) return items;

    const rowOrder = JSON.parse(saved);
    if (!Array.isArray(rowOrder)) return items;

    // Put items into saved order
    const ordered = rowOrder
      .map((id) => items.find((r) => getRowId({ data: r }) === id))
      .filter(Boolean);

    // Append leftovers not in saved order
    const leftovers = items.filter(
      (r) => !rowOrder.includes(getRowId({ data: r }))
    );

    return [...ordered, ...leftovers];
  } catch (e) {
    console.warn("Failed to restore order from storage", e);
    return items;
  }
}
