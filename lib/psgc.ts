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
 * Normalize location name for matching (case-insensitive, trim, handle common variations)
 */
function normalizeLocationName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\./g, "")
    .replace(/-/g, " ");
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
 * Find barangay by name within a city/municipality
 */
export async function findBarangayByName(
  barangayName: string,
  cityCode: string
): Promise<PSGCBarangay | null> {
  const normalized = normalizeLocationName(barangayName);
  const barangays = await fetchBarangaysByCity(cityCode);

  // Exact match first
  let match = barangays.find(
    (b) => normalizeLocationName(b.name) === normalized
  );

  if (match) return match;

  // Partial match (contains) - handle variations like "BUSEL-BUSEL" vs "BUSEL BUSEL"
  match = barangays.find((b) => {
    const bName = normalizeLocationName(b.name);
    return (
      bName.includes(normalized) ||
      normalized.includes(bName) ||
      bName.replace(/-/g, " ") === normalized.replace(/-/g, " ")
    );
  });

  return match || null;
}
