"use client";

import * as React from "react";

import type { MemberFormData } from "@/features/members/types/member.types";
import {
  fetchBarangaysByCity,
  fetchCitiesByProvince,
  fetchProvinces,
  type PSGCBarangay,
  type PSGCCityMunicipality,
  type PSGCProvince,
} from "@/lib/psgc";

interface MemberLocationFieldsProps {
  formData: MemberFormData;
  onFormDataChange: <K extends keyof MemberFormData>(
    field: K,
    value: MemberFormData[K]
  ) => void;
}

export function MemberLocationFields({
  formData,
  onFormDataChange,
}: MemberLocationFieldsProps) {
  const [provinces, setProvinces] = React.useState<PSGCProvince[]>([]);
  const [cities, setCities] = React.useState<PSGCCityMunicipality[]>([]);
  const [barangays, setBarangays] = React.useState<PSGCBarangay[]>([]);

  const [loadingProvinces, setLoadingProvinces] = React.useState(false);
  const [loadingCities, setLoadingCities] = React.useState(false);
  const [loadingBarangays, setLoadingBarangays] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoadingProvinces(true);
        const data = await fetchProvinces();
        setProvinces(data);
      } catch (e) {
        console.error("Failed to load provinces from PSGC", e);
      } finally {
        setLoadingProvinces(false);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!formData.province_code) {
      setCities([]);
      setBarangays([]);
      return;
    }
    const load = async () => {
      try {
        setLoadingCities(true);
        const data = await fetchCitiesByProvince(formData.province_code);
        setCities(data);
      } catch (e) {
        console.error("Failed to load cities from PSGC", e);
      } finally {
        setLoadingCities(false);
      }
    };
    load();
  }, [formData.province_code]);

  React.useEffect(() => {
    if (!formData.city_municipality_code) {
      setBarangays([]);
      return;
    }
    const load = async () => {
      try {
        setLoadingBarangays(true);
        const data = await fetchBarangaysByCity(
          formData.city_municipality_code
        );
        setBarangays(data);
      } catch (e) {
        console.error("Failed to load barangays from PSGC", e);
      } finally {
        setLoadingBarangays(false);
      }
    };
    load();
  }, [formData.city_municipality_code]);

  const handleProvinceChange = (code: string) => {
    const province = provinces.find((p) => p.code === code) || null;
    onFormDataChange("province_code", code);
    onFormDataChange("province_name", province?.name || "");
    // Reset lower levels
    onFormDataChange("city_municipality_code", "");
    onFormDataChange("city_municipality_name", "");
    onFormDataChange("barangay_code", "");
    onFormDataChange("barangay_name", "");
  };

  const handleCityChange = (code: string) => {
    const city = cities.find((c) => c.code === code) || null;
    onFormDataChange("city_municipality_code", code);
    onFormDataChange("city_municipality_name", city?.name || "");
    onFormDataChange("barangay_code", "");
    onFormDataChange("barangay_name", "");
  };

  const handleBarangayChange = (code: string) => {
    const brgy = barangays.find((b) => b.code === code) || null;
    onFormDataChange("barangay_code", code);
    onFormDataChange("barangay_name", brgy?.name || "");
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Province *
        </label>
        <select
          required
          value={formData.province_code}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 md:py-2 md:text-sm"
          style={{ fontSize: "16px" }}
        >
          <option value="">
            {loadingProvinces ? "Loading provinces…" : "Select province"}
          </option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          City / Municipality *
        </label>
        <select
          required
          disabled={!formData.province_code || loadingCities}
          value={formData.city_municipality_code}
          onChange={(e) => handleCityChange(e.target.value)}
          className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 md:py-2 md:text-sm"
          style={{ fontSize: "16px" }}
        >
          <option value="">
            {!formData.province_code
              ? "Select province first"
              : loadingCities
                ? "Loading cities…"
                : "Select city / municipality"}
          </option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Barangay *
        </label>
        <select
          required
          disabled={!formData.city_municipality_code || loadingBarangays}
          value={formData.barangay_code}
          onChange={(e) => handleBarangayChange(e.target.value)}
          className="w-full px-3 py-3 text-base min-h-[44px] border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 md:py-2 md:text-sm"
          style={{ fontSize: "16px" }}
        >
          <option value="">
            {!formData.city_municipality_code
              ? "Select city / municipality first"
              : loadingBarangays
                ? "Loading barangays…"
                : "Select barangay"}
          </option>
          {barangays.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
