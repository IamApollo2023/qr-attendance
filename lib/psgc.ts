export interface PSGCProvince {
  code: string;
  name: string;
}

export interface PSGCCityMunicipality {
  code: string;
  name: string;
}

export interface PSGCBarangay {
  code: string;
  name: string;
}

const BASE_URL = "https://psgc.gitlab.io/api";

export async function fetchProvinces(): Promise<PSGCProvince[]> {
  const res = await fetch(`${BASE_URL}/provinces/`);
  const data = await res.json();
  return data as PSGCProvince[];
}

export async function fetchCitiesByProvince(
  provinceCode: string
): Promise<PSGCCityMunicipality[]> {
  const res = await fetch(
    `${BASE_URL}/provinces/${encodeURIComponent(provinceCode)}/cities-municipalities/`
  );
  const data = await res.json();
  return data as PSGCCityMunicipality[];
}

export async function fetchBarangaysByCity(
  cityCode: string
): Promise<PSGCBarangay[]> {
  const res = await fetch(
    `${BASE_URL}/cities-municipalities/${encodeURIComponent(
      cityCode
    )}/barangays/`
  );
  const data = await res.json();
  return data as PSGCBarangay[];
}

/**
 * Convert Arabic numerals to Roman numerals for location name matching
 */
function numberToRoman(num: number): string {
  const romanMap: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let result = "";
  for (const [value, symbol] of romanMap) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

/**
 * Normalize location name for matching (case-insensitive, trim, handle common variations)
 * Handles number-to-roman conversions (e.g., "Rimos 5" -> "RIMOS V")
 * Handles hyphenated names (e.g., "BUSEL-BUSEL" -> "BUSEL BUSEL")
 */
function normalizeLocationName(name: string): string {
  let normalized = name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "");

  // Handle hyphens: convert to spaces and also try without spaces (for "BUSEL-BUSEL" -> "BUSELBUSEL")
  // First, replace hyphens with spaces for matching
  normalized = normalized.replace(/-/g, " ");

  // Convert standalone numbers to Roman numerals (e.g., "5" -> "V", "10" -> "X")
  // Match numbers at word boundaries
  normalized = normalized.replace(/\b(\d+)\b/g, (match, numStr) => {
    const num = parseInt(numStr, 10);
    if (num > 0 && num <= 50) {
      // Limit to reasonable range for location names
      return numberToRoman(num);
    }
    return match;
  });

  return normalized;
}

/**
 * Find province by name (case-insensitive fuzzy match)
 */
export async function findProvinceByName(
  provinceName: string
): Promise<PSGCProvince | null> {
  const normalized = normalizeLocationName(provinceName);
  const provinces = await fetchProvinces();

  // Exact match first
  let match = provinces.find(
    (p) => normalizeLocationName(p.name) === normalized
  );

  if (match) return match;

  // Partial match (contains)
  match = provinces.find(
    (p) =>
      normalizeLocationName(p.name).includes(normalized) ||
      normalized.includes(normalizeLocationName(p.name))
  );

  return match || null;
}

/**
 * Find city/municipality by name within a province
 */
export async function findCityByName(
  cityName: string,
  provinceCode: string
): Promise<PSGCCityMunicipality | null> {
  const normalized = normalizeLocationName(cityName);
  const cities = await fetchCitiesByProvince(provinceCode);

  // Exact match first
  let match = cities.find((c) => normalizeLocationName(c.name) === normalized);

  if (match) return match;

  // Partial match (contains)
  match = cities.find(
    (c) =>
      normalizeLocationName(c.name).includes(normalized) ||
      normalized.includes(normalizeLocationName(c.name))
  );

  return match || null;
}

/**
 * Normalize name by removing all spaces and hyphens for compact matching
 * e.g., "BUSEL-BUSEL" -> "BUSELBUSEL", "BUSEL BUSEL" -> "BUSELBUSEL"
 */
function normalizeCompact(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .replace(/\./g, "");
}

/**
 * Find barangay by name within a city/municipality
 * Handles variations like:
 * - "Rimos 5" vs "Rimos V" (number-to-roman)
 * - "BUSEL-BUSEL" vs "Buselbusel" vs "Busel Busel" (hyphenated names)
 */
export async function findBarangayByName(
  barangayName: string,
  cityCode: string
): Promise<PSGCBarangay | null> {
  const normalized = normalizeLocationName(barangayName);
  const compact = normalizeCompact(barangayName);
  const barangays = await fetchBarangaysByCity(cityCode);

  // Exact match first (normalized)
  let match = barangays.find(
    (b) => normalizeLocationName(b.name) === normalized
  );

  if (match) return match;

  // Try compact match (removes all spaces and hyphens)
  // This handles "BUSEL-BUSEL" matching "Buselbusel" or "Busel Busel"
  match = barangays.find((b) => {
    const bCompact = normalizeCompact(b.name);
    return bCompact === compact;
  });

  if (match) return match;

  // Try matching with original input (before number-to-roman conversion)
  // This handles cases where the database has "5" but we're searching with "V"
  const originalNormalized = barangayName
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .replace(/-/g, " ");

  match = barangays.find((b) => {
    const bName = normalizeLocationName(b.name);
    const bOriginal = b.name
      .trim()
      .toUpperCase()
      .replace(/\s+/g, " ")
      .replace(/\./g, "")
      .replace(/-/g, " ");

    return (
      bName === normalized ||
      bOriginal === originalNormalized ||
      bName.includes(normalized) ||
      normalized.includes(bName) ||
      bOriginal.includes(originalNormalized) ||
      originalNormalized.includes(bOriginal) ||
      bName.replace(/-/g, " ") === normalized.replace(/-/g, " ") ||
      bOriginal.replace(/-/g, " ") === originalNormalized.replace(/-/g, " ")
    );
  });

  if (match) return match;

  // Try fuzzy match - remove numbers/romans and match base name
  // e.g., "RIMOS 5" and "RIMOS V" both match "RIMOS"
  const baseName = normalized.replace(/\b([IVXLCDM]+|\d+)\b/g, "").trim();
  if (baseName.length > 2) {
    match = barangays.find((b) => {
      const bName = normalizeLocationName(b.name);
      const bBaseName = bName.replace(/\b([IVXLCDM]+|\d+)\b/g, "").trim();
      const bCompactBase = normalizeCompact(bBaseName);
      const compactBase = normalizeCompact(baseName);

      return (
        bBaseName === baseName ||
        bBaseName.includes(baseName) ||
        baseName.includes(bBaseName) ||
        bCompactBase === compactBase
      );
    });
  }

  return match || null;
}
