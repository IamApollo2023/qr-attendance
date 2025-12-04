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





