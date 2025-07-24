import * as XLSX from "xlsx";

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function filterBySearch(items, getFields, search) {
  const lower = search.toLowerCase();
  return items.filter((item) =>
    getFields(item).some((field) =>
      String(field || "")
        .toLowerCase()
        .includes(lower)
    )
  );
}

export function paginate(array, currentPage, itemsPerPage) {
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  return array.slice(indexOfFirst, indexOfLast);
}

export function getTotalPages(array, itemsPerPage) {
  return Math.ceil(array.length / itemsPerPage);
}

export function sort(properties, key) {
  return [...properties].sort((a, b) => {
    const aValue = a[key] || "";
    const bValue = b[key] || "";
    return aValue.localeCompare(bValue);
  });
}

// Utility to remove unwanted keys from an array of objects
function omitKeys(arr, keysToOmit) {
  return arr.map((obj) => {
    const newObj = { ...obj };
    keysToOmit.forEach((key) => delete newObj[key]);
    return newObj;
  });
}

export function exportProperty(property) {
  if (!property) return;

  // Main property info
  const { suites, services, utilities, codes, ...main } = property;
  const mainSheet = XLSX.utils.json_to_sheet([main]);

  // Omit keys and add contacts column
  const suiteOmit = ["property_yardi", "suite_id"];
  const serviceOmit = ["property_yardi", "service_id"];
  const utilityOmit = ["property_yardi", "utility_id"];
  const codeOmit = ["property_yardi", "code_id"];

  function omitAndAddContacts(arr, keysToOmit) {
    return arr.map((obj) => {
      const newObj = { ...obj };
      keysToOmit.forEach((key) => delete newObj[key]);
      newObj.contacts =
        obj.contacts && obj.contacts.length
          ? obj.contacts.map((c) => {
              const office = c.office_number || "";
              const cell = c.cell_number || "";
              const phone = office || cell || c.phone || "";
              return `${c.name}${c.title ? ", " + c.title : ""} (${phone}${phone && c.email ? ", " : ""}${c.email || ""})`;
            }).join("\n")
          : "";
      return newObj;
    });
  }

  const suitesSheet =
    suites && suites.length
      ? XLSX.utils.json_to_sheet(omitAndAddContacts(suites, suiteOmit))
      : XLSX.utils.json_to_sheet([{}]);
  const servicesSheet =
    services && services.length
      ? XLSX.utils.json_to_sheet(omitAndAddContacts(services, serviceOmit))
      : XLSX.utils.json_to_sheet([{}]);
  const utilitiesSheet =
    utilities && utilities.length
      ? XLSX.utils.json_to_sheet(omitAndAddContacts(utilities, utilityOmit))
      : XLSX.utils.json_to_sheet([{}]);
  const codesSheet =
    codes && codes.length
      ? XLSX.utils.json_to_sheet(omitKeys(codes, codeOmit))
      : XLSX.utils.json_to_sheet([{}]);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, mainSheet, "Property");
  XLSX.utils.book_append_sheet(workbook, suitesSheet, "Suites");
  XLSX.utils.book_append_sheet(workbook, servicesSheet, "Services");
  XLSX.utils.book_append_sheet(workbook, utilitiesSheet, "Utilities");
  XLSX.utils.book_append_sheet(workbook, codesSheet, "Codes");

  const fileName = `${property.address || property.yardi || "property"}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
