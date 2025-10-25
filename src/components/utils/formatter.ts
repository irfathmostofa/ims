// 📦 src/utils/formatter.ts

/**
 * Format ISO date string (e.g. "2025-10-24T18:00:00.000Z")
 * into "dd/mm/yyyy" format
 */
export function formatDate(value?: string | Date): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format ISO date string into "dd/mm/yyyy hh:mm AM/PM"
 */
export function formatDateTime(value?: string | Date): string {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

/**
 * Format number to currency (default: BDT)
 */
export function formatCurrency(
  value?: number,
  currency: string = "BDT"
): string {
  if (value === undefined || value === null || isNaN(value)) return "-";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format status flag (e.g., "A" -> "Active", "I" -> "Inactive")
 */
export function formatStatus(value?: string): string {
  if (!value) return "-";
  const map: Record<string, string> = {
    A: "Active",
    I: "Inactive",
  };
  return map[value.toUpperCase()] || value;
}

export function formatDateForInput(date?: string | null) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}
