/**
 * Utility functions for generating CSV files
 */

export interface CSVRow {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Converts an array of objects to CSV format
 */
export function objectsToCSV(data: CSVRow[], headers?: Record<string, string>): string {
  if (data.length === 0) return "";

  const keys = Object.keys(data[0]);
  
  // Build header row
  const headerRow = keys.map(key => {
    const label = headers?.[key] || key;
    return `"${label.replace(/"/g, '""')}"`;
  }).join(",");

  // Build data rows
  const rows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '""';
      if (typeof value === "string") {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return `"${value}"`;
    }).join(",");
  });

  return [headerRow, ...rows].join("\n");
}

/**
 * Triggers a CSV file download in the browser
 */
export function downloadCSV(data: CSVRow[], filename: string, headers?: Record<string, string>): void {
  const csv = objectsToCSV(data, headers);
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
