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
export function convertNumberToWords(num: number): string {
  if (num === 0) return "";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num < 20) return ones[num];

  if (num < 100) {
    return (
      tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "")
    );
  }

  if (num < 1000) {
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 !== 0 ? " and " + convertNumberToWords(num % 100) : "")
    );
  }

  if (num < 100000) {
    return (
      convertNumberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 !== 0 ? " " + convertNumberToWords(num % 1000) : "")
    );
  }

  if (num < 10000000) {
    return (
      convertNumberToWords(Math.floor(num / 100000)) +
      " Lac" +
      (num % 100000 !== 0 ? " " + convertNumberToWords(num % 100000) : "")
    );
  }

  if (num < 1000000000) {
    return (
      convertNumberToWords(Math.floor(num / 10000000)) +
      " Crore" +
      (num % 10000000 !== 0 ? " " + convertNumberToWords(num % 10000000) : "")
    );
  }

  return "Number is too large";
}
