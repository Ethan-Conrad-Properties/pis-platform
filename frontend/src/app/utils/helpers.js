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
