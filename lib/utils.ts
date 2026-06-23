/**
 * Calculates a patient's current age based on their Date of Birth.
 * Supports both YYYY-MM-DD and DD/MM/YYYY.
 */
export function calculateAge(dobString: string): number | null {
  if (!dobString) return null;

  let dob = new Date(dobString);
  
  // Handle DD/MM/YYYY fallback
  if (isNaN(dob.getTime()) && dobString.includes("/")) {
    const parts = dobString.split("/");
    if (parts.length === 3) {
      dob = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }

  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (age > 100 || age < 0) {
    return -1; // -1 indicates an invalid or logically wrong age
  }

  return age;
}

/**
 * Formats a date string (YYYY-MM-DD or DD/MM/YYYY) to DD/MM/YYYY.
 * Returns "—" if the input is missing or invalid.
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";

  // If it's already DD/MM/YYYY (exactly 10 chars, 2 slashes), just return it
  if (dateStr.length === 10 && dateStr[2] === "/" && dateStr[5] === "/") {
    return dateStr;
  }

  let d = new Date(dateStr);
  
  if (isNaN(d.getTime()) && dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }

  if (isNaN(d.getTime())) return "—";

  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Sorts an array of objects by a date field.
 * Handles missing dates and empty values safely.
 */
export function sortDataByDate<T>(
  data: T[],
  sortField: keyof T | null,
  sortOrder: "asc" | "desc",
  fallbackField?: string
): T[] {
  if (!sortField) return data;

  return [...data].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (!aVal && fallbackField) aVal = (a as any)[fallbackField];
    if (!bVal && fallbackField) bVal = (b as any)[fallbackField];

    if (!aVal && !bVal) return 0;
    if (!aVal) return 1; // empty goes to bottom
    if (!bVal) return -1;

    const dateA = new Date(aVal as string).getTime();
    const dateB = new Date(bVal as string).getTime();

    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
}
