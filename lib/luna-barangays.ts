export type LunaBarangay =
  | "Alcala"
  | "Baraca"
  | "Bungro"
  | "Cabaritan Norte"
  | "Cabaritan Sur"
  | "Magallanes"
  | "Nalvo"
  | "Nalvo Norte"
  | "Nalvo Sur"
  | "Namalyan"
  | "Oya-oy"
  | "Poblacion 1"
  | "Poblacion 2"
  | "Poblacion 3"
  | "Salcedo"
  | "Santo Domingo"
  | "Victoria";

export const LUNA_CENTER: [number, number] = [16.8531, 120.3897];

export const LUNA_BARANGAY_COORDS: Record<
  LunaBarangay,
  { lat: number; lng: number }
> = {
  Alcala: { lat: 16.8467, lng: 120.3939 },
  Baraca: { lat: 16.8583, lng: 120.383 },
  Bungro: { lat: 16.8515, lng: 120.3805 },
  "Cabaritan Norte": { lat: 16.8631, lng: 120.3953 },
  "Cabaritan Sur": { lat: 16.8579, lng: 120.398 },
  Magallanes: { lat: 16.8475, lng: 120.4002 },
  Nalvo: { lat: 16.8425, lng: 120.386 },
  "Nalvo Norte": { lat: 16.8465, lng: 120.3838 },
  "Nalvo Sur": { lat: 16.8391, lng: 120.3819 },
  Namalyan: { lat: 16.8514, lng: 120.4073 },
  "Oya-oy": { lat: 16.8601, lng: 120.404 },
  "Poblacion 1": { lat: 16.8551, lng: 120.391 },
  "Poblacion 2": { lat: 16.856, lng: 120.3885 },
  "Poblacion 3": { lat: 16.8575, lng: 120.3901 },
  Salcedo: { lat: 16.8489, lng: 120.3787 },
  "Santo Domingo": { lat: 16.8539, lng: 120.3738 },
  Victoria: { lat: 16.8442, lng: 120.3974 },
};

export const LUNA_BARANGAY_OPTIONS: string[] = Object.keys(
  LUNA_BARANGAY_COORDS
) as LunaBarangay[];



