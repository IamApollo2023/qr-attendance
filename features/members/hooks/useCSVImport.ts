import { useCallback } from "react";
import { bulkImportMembers } from "@/lib";
import type { CreateMemberInput } from "@/lib/members";
import {
  findProvinceByName,
  findCityByName,
  findBarangayByName,
  type PSGCProvince,
  type PSGCCityMunicipality,
  type PSGCBarangay,
} from "@/lib/psgc";

interface UseCSVImportProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  onPartialSuccess?: (success: number, errors: string[]) => void;
}

/**
 * Convert date from "YYYY MMM DD" format (e.g., "1977 FEB 12") to "YYYY-MM-DD"
 */
function parseLegacyDate(dateStr: string): string | null {
  const trimmed = dateStr.trim();

  // Handle "YYYY MMM DD" or "YYYY MMMDD" format
  const match = trimmed.match(/^(\d{4})\s+([A-Z]{3,})\s+(\d{1,2})$/i);
  if (match) {
    const [, year, monthStr, day] = match;
    const monthMap: Record<string, string> = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      SEPT: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };
    const month = monthMap[monthStr.toUpperCase()];
    if (month) {
      return `${year}-${month}-${day.padStart(2, "0")}`;
    }
  }

  // Handle "/" format (MM/DD/YYYY or DD/MM/YYYY)
  if (trimmed.includes("/")) {
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      // Assume MM/DD/YYYY format
      return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
    }
  }

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Hook for handling CSV import functionality
 * Supports both code-based and name-based location columns
 */
export function useCSVImport({
  onSuccess,
  onError,
  onPartialSuccess,
}: UseCSVImportProps = {}) {
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error(
            "CSV must have at least a header row and one data row"
          );
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        // Required columns: first_name, last_name (or sur_name), birthday (or birthdate), gender, membership_type
        // Location can be either codes OR names
        const hasFirstName = headers.includes("first_name");
        const hasLastName =
          headers.includes("last_name") || headers.includes("sur_name");
        const hasBirthday =
          headers.includes("birthday") || headers.includes("birthdate");
        const hasGender = headers.includes("gender");
        const hasMembershipType = headers.includes("membership_type");

        // Location columns - accept either codes or names
        const hasProvinceCode = headers.includes("province_code");
        const hasProvinceName = headers.includes("province");
        const hasCityCode = headers.includes("city_municipality_code");
        const hasCityName =
          headers.includes("city") ||
          headers.includes("municipality") ||
          headers.includes("city/municipality");
        const hasBarangayCode = headers.includes("barangay_code");
        const hasBarangayName = headers.includes("barangay");

        const missingRequired = [];
        if (!hasFirstName) missingRequired.push("first_name");
        if (!hasLastName) missingRequired.push("last_name or sur_name");
        if (!hasBirthday) missingRequired.push("birthday or birthdate");
        if (!hasGender) missingRequired.push("gender");
        if (!hasMembershipType) missingRequired.push("membership_type");
        if (!hasProvinceCode && !hasProvinceName)
          missingRequired.push("province_code or province");
        if (!hasCityCode && !hasCityName)
          missingRequired.push("city_municipality_code or city/municipality");
        if (!hasBarangayCode && !hasBarangayName)
          missingRequired.push("barangay_code or barangay");

        if (missingRequired.length > 0) {
          throw new Error(
            `Missing required columns: ${missingRequired.join(", ")}`
          );
        }

        // Cache for PSGC lookups to avoid redundant API calls
        const provinceCache = new Map<string, PSGCProvince | null>();
        const cityCache = new Map<string, PSGCCityMunicipality | null>();
        const barangayCache = new Map<string, PSGCBarangay | null>();

        const membersToImport: CreateMemberInput[] = [];
        const lookupErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          // Handle column name aliases
          const firstName = row.first_name || "";
          const lastName = row.last_name || row.sur_name || "";
          const birthdayRaw = row.birthday || row.birthdate || "";
          const gender = row.gender || "";
          const membershipType = row.membership_type || "";

          // Get location values (codes or names)
          const provinceCode = row.province_code || "";
          const provinceName =
            row.province || (provinceCode && !hasProvinceName ? undefined : "");
          const cityCode = row.city_municipality_code || "";
          const cityName =
            row.city ||
            row.municipality ||
            row["city/municipality"] ||
            (cityCode && !hasCityName ? undefined : "");
          const barangayCode = row.barangay_code || "";
          const barangayName =
            row.barangay || (barangayCode && !hasBarangayName ? undefined : "");

          // Validate required fields
          if (
            !firstName ||
            !lastName ||
            !birthdayRaw ||
            !gender ||
            !membershipType
          ) {
            continue; // Skip incomplete rows
          }

          // Validate gender
          const normalizedGender = gender.toLowerCase();
          if (normalizedGender !== "male" && normalizedGender !== "female") {
            continue; // Skip invalid gender
          }

          // Normalize membership_type
          let membership_type = membershipType.trim();
          if (
            !["WSAM-LGAM", "LGAM", "WSAM", "Attendee"].includes(membership_type)
          ) {
            continue; // Skip invalid membership type
          }

          // Handle classification (optional)
          let classification = row.classification?.trim().toUpperCase();
          if (
            classification &&
            !["MEMBER", "WORKER", "PASTOR", "ATTENDEE"].includes(classification)
          ) {
            classification = undefined;
          } else if (classification) {
            // Ensure it's a valid ClassificationType
            classification = classification as
              | "MEMBER"
              | "WORKER"
              | "PASTOR"
              | "ATTENDEE";
          }

          // Parse birthday
          const birthday = parseLegacyDate(birthdayRaw);
          if (!birthday) {
            lookupErrors.push(
              `Row ${i + 1}: Invalid date format "${birthdayRaw}"`
            );
            continue;
          }

          // Resolve location codes from names if needed
          let finalProvinceCode = provinceCode;
          let finalProvinceName = provinceName;
          let finalCityCode = cityCode;
          let finalCityName = cityName;
          let finalBarangayCode = barangayCode;
          let finalBarangayName = barangayName;

          // Lookup province if we have name but not code
          if (!finalProvinceCode && provinceName) {
            const cacheKey = provinceName.toUpperCase();
            if (!provinceCache.has(cacheKey)) {
              const found = await findProvinceByName(provinceName);
              provinceCache.set(cacheKey, found);
            }
            const province = provinceCache.get(cacheKey);
            if (province) {
              finalProvinceCode = province.code;
              finalProvinceName = province.name;
            } else {
              lookupErrors.push(
                `Row ${i + 1}: Province "${provinceName}" not found`
              );
              continue;
            }
          }

          // Lookup city if we have name but not code
          if (!finalCityCode && cityName && finalProvinceCode) {
            const cacheKey = `${finalProvinceCode}:${cityName.toUpperCase()}`;
            if (!cityCache.has(cacheKey)) {
              const found = await findCityByName(cityName, finalProvinceCode);
              cityCache.set(cacheKey, found);
            }
            const city = cityCache.get(cacheKey);
            if (city) {
              finalCityCode = city.code;
              finalCityName = city.name;
            } else {
              lookupErrors.push(
                `Row ${i + 1}: City/Municipality "${cityName}" not found in province`
              );
              continue;
            }
          }

          // Lookup barangay if we have name but not code
          if (!finalBarangayCode && barangayName && finalCityCode) {
            const cacheKey = `${finalCityCode}:${barangayName.toUpperCase()}`;
            if (!barangayCache.has(cacheKey)) {
              const found = await findBarangayByName(
                barangayName,
                finalCityCode
              );
              barangayCache.set(cacheKey, found);
            }
            const barangay = barangayCache.get(cacheKey);
            if (barangay) {
              finalBarangayCode = barangay.code;
              finalBarangayName = barangay.name;
            } else {
              lookupErrors.push(
                `Row ${i + 1}: Barangay "${barangayName}" not found in city/municipality`
              );
              continue;
            }
          }

          // Validate we have all location codes
          if (!finalProvinceCode || !finalCityCode || !finalBarangayCode) {
            lookupErrors.push(`Row ${i + 1}: Missing location information`);
            continue;
          }

          membersToImport.push({
            first_name: firstName,
            middle_name: row.middle_name || undefined,
            last_name: lastName,
            province_code: finalProvinceCode,
            province_name: finalProvinceName || undefined,
            city_municipality_code: finalCityCode,
            city_municipality_name: finalCityName || undefined,
            barangay_code: finalBarangayCode,
            barangay_name: finalBarangayName || undefined,
            birthday: birthday,
            gender: normalizedGender as "male" | "female",
            membership_type: membership_type as
              | "WSAM-LGAM"
              | "LGAM"
              | "WSAM"
              | "Attendee",
            classification: classification as
              | "MEMBER"
              | "WORKER"
              | "PASTOR"
              | "ATTENDEE"
              | undefined,
            member_id: row.member_id || undefined,
          });
        }

        if (membersToImport.length === 0) {
          const errorMsg =
            lookupErrors.length > 0
              ? `No valid members found. Errors:\n${lookupErrors.slice(0, 10).join("\n")}${
                  lookupErrors.length > 10
                    ? `\n... and ${lookupErrors.length - 10} more errors`
                    : ""
                }`
              : "No valid members found in CSV";
          throw new Error(errorMsg);
        }

        const result = await bulkImportMembers(membersToImport);

        // Combine import errors with lookup errors
        const allErrors = [...lookupErrors, ...result.errors];

        if (allErrors.length > 0) {
          onPartialSuccess?.(result.success, allErrors);
        } else {
          onSuccess?.(`Imported ${result.success} members successfully`);
        }
      } catch (error: any) {
        console.error("Failed to import CSV:", error);
        const errorMessage = error?.message || "Failed to import CSV file";
        onError?.(errorMessage);
      }
    },
    [onSuccess, onError, onPartialSuccess]
  );

  return {
    handleFileUpload,
  };
}
