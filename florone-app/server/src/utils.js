const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(value) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

// Parse a possibly Persian/formatted price string into a plain number.
export function parsePrice(value) {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "")
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\d.]/g, "");
  return Number(normalized || 0);
}

// Format a number into a grouped Persian price string, e.g. 650000 -> "۶۵۰,۰۰۰"
export function formatToman(n) {
  const grouped = Math.round(Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return toFa(grouped);
}

// Coerce multipart/form string booleans into real booleans.
export function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  const v = String(value).toLowerCase();
  return v === "true" || v === "1" || v === "on" || v === "yes";
}

export function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

// Ensure a price value is stored as a nice Persian display string.
export function toPriceLabel(value) {
  if (value === undefined || value === null || value === "") return "";
  const num = parsePrice(value);
  return num > 0 ? formatToman(num) : String(value);
}
