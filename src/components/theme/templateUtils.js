/**
 * Helper utilities for dynamic template rendering
 */

// Returns true if value is non-empty, non-null, non-undefined, and not a blank placeholder
export const hasVal = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return (
      trimmed !== "" &&
      trimmed !== "null" &&
      trimmed !== "undefined" &&
      trimmed !== "N/A" &&
      trimmed !== "-"
    );
  }
  if (typeof val === "number") return !isNaN(val) && val > 0;
  if (Array.isArray(val)) return val.length > 0 && val.some((item) => hasVal(item));
  if (typeof val === "object") return Object.values(val).some((item) => hasVal(item));
  return Boolean(val);
};

// Returns true for non-zero numbers or non-zero numeric strings
export const hasPositiveNum = (val) => {
  if (val === null || val === undefined) return false;
  const num = Number(val);
  return !isNaN(num) && num > 0;
};

// Returns true if any item in the array has a valid non-zero or non-empty value for key
export const hasColValue = (items, key) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some((item) => {
    const val = item[key];
    if (key === "labour" || key === "material" || key === "rate" || key === "total" || key === "amount" || key === "qty" || key === "quantity") {
      return hasPositiveNum(val);
    }
    return hasVal(val);
  });
};
