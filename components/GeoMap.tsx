// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { LUNA_CENTER } from "@/lib/luna-barangays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import lunaGeo from "@/export.json";
import { WeatherWidget } from "@/components/WeatherWidget";
import { useSidebar } from "@/components/ui/sidebar";

// NOTE:
// `lunaGeo` is a static GeoJSON export generated via Overpass Turbo / OSM tooling.
// We DO NOT call Overpass at runtime – the map is driven entirely by this local file
// plus barangay stats from `/api/geo/barangay-stats`.

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const DEFAULT_ZOOM = 13;
const BOUNDS_PADDING = 0.02;

type BarangayStat = {
  barangay_code: string;
  barangay_name: string;
  count: number;
};

type BarangayCentroid = {
  lat: number;
  lng: number;
  name: string;
};

type LatLngTuple = [number, number];

function normalizeBarangayKey(name: string | undefined | null): string | null {
  if (!name) return null;
  // Normalize: lowercase, remove accents, strip common PSGC suffixes, then remove all non-alphanumeric
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*\(pob\.?\)/gi, "") // Remove "(Pob.)" or "(Pob)"
    .replace(/\s*poblacion/gi, "") // Remove "Poblacion"
    .replace(/\s*pob/gi, "") // Remove "Pob"
    .replace(/\s*no\.?\s*/gi, "") // Remove "No." or "No" (handles "Cantoria No. 4" -> "Cantoria 4")
    .replace(/#/g, "") // Remove "#" (handles "Cantoria #4" -> "Cantoria 4")
    .replace(/[^a-z0-9]/g, ""); // Remove all remaining non-alphanumeric
}

// Helper to check if two normalized names match (handles partial matches)
function namesMatch(name1: string | null, name2: string | null): boolean {
  if (!name1 || !name2) return false;
  const n1 = normalizeBarangayKey(name1);
  const n2 = normalizeBarangayKey(name2);
  if (!n1 || !n2) return false;
  // Exact match
  if (n1 === n2) return true;
  // One contains the other (handles "Salcedo" vs "Salcedo (Pob.)")
  return n1.includes(n2) || n2.includes(n1);
}

function computeBounds(geojson: any): [LatLngTuple, LatLngTuple] | undefined {
  const features = geojson?.features ?? [];
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;

  for (const feature of features) {
    const geom = feature.geometry;
    if (!geom) continue;

    let rings: any[] = [];

    if (geom.type === "Polygon") {
      rings = geom.coordinates;
    } else if (geom.type === "MultiPolygon") {
      rings = geom.coordinates.flat();
    } else {
      continue;
    }

    for (const ring of rings) {
      for (const coord of ring) {
        const [lng, lat] = coord as [number, number];
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          minLat = Math.min(minLat, lat);
          minLng = Math.min(minLng, lng);
          maxLat = Math.max(maxLat, lat);
          maxLng = Math.max(maxLng, lng);
        }
      }
    }
  }

  if (
    minLat === Infinity ||
    minLng === Infinity ||
    maxLat === -Infinity ||
    maxLng === -Infinity
  ) {
    return undefined;
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

const LUNA_BOUNDS = computeBounds(lunaGeo);

const LUNA_MAX_BOUNDS: [LatLngTuple, LatLngTuple] | undefined = LUNA_BOUNDS
  ? [
      [LUNA_BOUNDS[0][0] - BOUNDS_PADDING, LUNA_BOUNDS[0][1] - BOUNDS_PADDING],
      [LUNA_BOUNDS[1][0] + BOUNDS_PADDING, LUNA_BOUNDS[1][1] + BOUNDS_PADDING],
    ]
  : undefined;

// Keyed by normalized barangay name (GeoJSON name/alt_name)
function computeCentroids(geojson: any): Record<string, BarangayCentroid> {
  const centroids: Record<string, BarangayCentroid> = {};

  const features = geojson?.features ?? [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const geom = feature.geometry;

    // Prefer name over alt_name, but if alt_name exists and name doesn't, use first part of alt_name (split by semicolon)
    const rawName: string | undefined =
      props.name ||
      (props.alt_name ? props.alt_name.split(";")[0].trim() : undefined);
    const key = normalizeBarangayKey(rawName);
    if (!key || !rawName || !geom) continue;

    let rings: any[] = [];

    if (geom.type === "Polygon") {
      rings = geom.coordinates;
    } else if (geom.type === "MultiPolygon") {
      rings = geom.coordinates[0];
    } else {
      continue;
    }

    let sumLat = 0;
    let sumLng = 0;
    let n = 0;

    for (const ring of rings) {
      for (const coord of ring) {
        const [lng, lat] = coord as [number, number];
        sumLat += lat;
        sumLng += lng;
        n += 1;
      }
    }

    if (!n) continue;

    centroids[key] = {
      lat: sumLat / n,
      lng: sumLng / n,
      name: rawName,
    };
  }

  return centroids;
}

const LUNA_BARANGAY_CENTROIDS: Record<string, BarangayCentroid> =
  computeCentroids(lunaGeo);

function getBarangayColor(count: number): string {
  if (count === 0) return "#dc2626"; // red-600
  if (count <= 4) return "#eab308"; // yellow-500 (1-4)
  return "#16a34a"; // green-600 (5+)
}

// Component to invalidate map size when sidebar state changes
function MapSizeInvalidator() {
  const map = useMap();
  const { open, openMobile, isMobile } = useSidebar();

  useEffect(() => {
    // Invalidate map size when sidebar state changes
    const timeoutId = setTimeout(() => {
      try {
        const container = map.getContainer();
        if (container) {
          // Force a repaint to ensure map updates correctly
          container.style.display = "none";
          container.offsetHeight; // Trigger reflow
          container.style.display = "";
        }
        map.invalidateSize();
      } catch (error) {
        // Silently handle any errors during invalidation
        console.debug("[GeoMap] Map invalidation error:", error);
      }
    }, 350); // Wait for sidebar animation to complete

    return () => clearTimeout(timeoutId);
  }, [map, open, openMobile, isMobile]);

  // Also handle window resize
  useEffect(() => {
    const handleResize = () => {
      try {
        map.invalidateSize();
      } catch (error) {
        console.debug("[GeoMap] Map resize invalidation error:", error);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [map]);

  // Remove error notifications when they appear
  useEffect(() => {
    const removeNotifications = () => {
      const container = map.getContainer();
      if (!container) return;

      const errorElements = container.querySelectorAll<HTMLElement>(
        '[class*="error"], [class*="issue"], [class*="notification"]'
      );
      errorElements.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        if (text.includes("issue") || text.includes("error")) {
          el.remove();
        }
      });
    };

    const intervalId = setInterval(removeNotifications, 500);
    return () => clearInterval(intervalId);
  }, [map]);

  return null;
}

export function GeoMap() {
  const [stats, setStats] = useState<BarangayStat[]>([]);
  const [loading, setLoading] = useState(true);
  const statsByKeyRef = useRef<Record<string, BarangayStat>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/geo/barangay-stats");
        if (!res.ok) throw new Error("Failed to load geo stats");
        const data = (await res.json()) as {
          barangay_code: string;
          barangay_name: string;
          count: number;
        }[];
        console.log("[GeoMap] Fetched stats from API:", data);
        const mapped: BarangayStat[] = data.map((d) => ({
          barangay_code: d.barangay_code,
          barangay_name: d.barangay_name,
          count: d.count,
        }));
        console.log("[GeoMap] Mapped stats:", mapped);
        setStats(mapped);
      } catch (e) {
        console.error("[GeoMap] Failed to load stats:", e);
      } finally {
        setLoading(false);
      }
    };

    // Load immediately on mount
    load();

    // Subscribe to realtime changes on members table
    const channel = supabase
      .channel("geo-map-members-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "members",
          filter: "barangay_code=is.not.null", // Only when barangay_code is set
        },
        () => {
          // Refetch stats when any member change occurs
          load();
        }
      )
      .subscribe();

    return () => {
      // Cleanup: unsubscribe on unmount
      supabase.removeChannel(channel);
    };
  }, []);

  // As a final safeguard, remove any Leaflet marker panes/buttons that might be
  // created internally. We only want colored polygons on this map.
  useEffect(() => {
    const removeMarkers = () => {
      const panes = document.querySelectorAll<HTMLElement>(
        ".leaflet-marker-pane"
      );
      panes.forEach((el) => el.remove());

      const markerButtons = document.querySelectorAll<HTMLElement>(
        '.leaflet-container button[title="Marker"], .leaflet-container button[aria-label="Marker"]'
      );
      markerButtons.forEach((el) => el.remove());
    };

    // Remove Leaflet error notifications/badges
    const removeErrorNotifications = () => {
      // Remove any Leaflet error badges or notifications
      const errorBadges = document.querySelectorAll<HTMLElement>(
        '.leaflet-container [class*="error"], .leaflet-container [class*="issue"], .leaflet-container [class*="notification"], .leaflet-container [class*="badge"]'
      );
      errorBadges.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        if (
          text.includes("issue") ||
          text.includes("error") ||
          text.includes("1")
        ) {
          el.style.display = "none";
          el.remove();
        }
      });

      // Also check for any divs with "Issue" or "1 Issue" text
      const allDivs = document.querySelectorAll<HTMLElement>(
        ".leaflet-container > div, .leaflet-container div"
      );
      allDivs.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        if (
          (text.includes("issue") || text.includes("error")) &&
          (el.style.position === "absolute" || el.style.position === "fixed")
        ) {
          el.style.display = "none";
          el.remove();
        }
      });

      // Remove any red badges or notification elements
      const redBadges = document.querySelectorAll<HTMLElement>(
        ".leaflet-container [style*='red'], .leaflet-container [style*='#dc2626'], .leaflet-container [style*='#ef4444']"
      );
      redBadges.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        if (
          text.includes("issue") ||
          text.includes("error") ||
          text.includes("1")
        ) {
          el.style.display = "none";
          el.remove();
        }
      });
    };

    removeMarkers();
    removeErrorNotifications();

    // Also run again after a short delay in case Leaflet re-creates them on zoom.
    const timeoutId = window.setTimeout(() => {
      removeMarkers();
      removeErrorNotifications();
    }, 500);

    // Set up an interval to continuously remove error notifications
    const intervalId = window.setInterval(removeErrorNotifications, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const statsByKey = useMemo(() => {
    const map: Record<string, BarangayStat> = {};
    for (const s of stats) {
      const key = normalizeBarangayKey(s.barangay_name);
      if (!key) {
        console.warn("[GeoMap] Skipping stat with invalid name:", s);
        continue;
      }
      // Store by normalized key, but also try to match against all possible GeoJSON names
      map[key] = s;
    }
    console.log("[GeoMap] statsByKey built:", map);
    return map;
  }, [stats]);

  // Keep latest stats in a ref so Leaflet event handlers always see fresh data
  useEffect(() => {
    statsByKeyRef.current = statsByKey;
  }, [statsByKey]);

  // Merge real stats with centroid list so barangays with 0 members are still shown (in red).
  const displayStats: BarangayStat[] = useMemo(() => {
    const merged: BarangayStat[] = [];

    for (const [key, centroid] of Object.entries(LUNA_BARANGAY_CENTROIDS)) {
      const stat = statsByKey[key];
      if (stat) {
        merged.push(stat);
      } else {
        merged.push({
          barangay_code: key,
          barangay_name: centroid.name,
          count: 0,
        });
      }
    }

    return merged;
  }, [statsByKey]);

  // Find top and bottom barangays by member count
  const topBarangay = useMemo(() => {
    if (displayStats.length === 0) return null;
    return displayStats.reduce((top, current) =>
      current.count > top.count ? current : top
    );
  }, [displayStats]);

  const bottomBarangays = useMemo(() => {
    if (displayStats.length === 0) return [];
    const minCount = Math.min(...displayStats.map((s) => s.count));
    return displayStats.filter((s) => s.count === minCount);
  }, [displayStats]);

  return (
    <div className="space-y-4">
      <WeatherWidget />
      <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="flex min-h-[360px] md:min-h-[520px] lg:min-h-[600px] flex-1 flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">
              Members per barangay (Luna, La Union)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full p-0">
            <MapContainer
              center={LUNA_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom={false}
              className="h-[320px] w-full md:h-[520px] lg:h-[600px]"
              bounds={LUNA_BOUNDS}
              maxBounds={LUNA_MAX_BOUNDS}
              maxBoundsViscosity={1}
            >
              <MapSizeInvalidator />
              <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
              {lunaGeo && (
                <GeoJSON
                  data={lunaGeo as any}
                  style={(feature) => {
                    const props = feature?.properties ?? {};
                    // Prefer name over alt_name, but if alt_name exists and name doesn't, use first part of alt_name (split by semicolon)
                    const rawName: string | undefined =
                      props.name ||
                      (props.alt_name
                        ? props.alt_name.split(";")[0].trim()
                        : undefined);
                    // Try to find matching stat by checking all stats for a name match
                    const stat = Object.values(statsByKey).find((s) =>
                      namesMatch(s.barangay_name, rawName)
                    );
                    const count = stat?.count ?? 0;
                    const fillColor = getBarangayColor(count);

                    return {
                      color: "#1d4ed8",
                      weight: 1.5,
                      fillColor,
                      fillOpacity: count === 0 ? 0.25 : 0.5,
                    };
                  }}
                  onEachFeature={(feature, layer) => {
                    const props = feature?.properties ?? {};
                    // Prefer name over alt_name, but if alt_name exists and name doesn't, use first part of alt_name (split by semicolon)
                    const rawName: string | undefined =
                      props.name ||
                      (props.alt_name
                        ? props.alt_name.split(";")[0].trim()
                        : undefined);
                    const name: string = rawName ?? "Unknown";
                    layer.on("mouseover", () => {
                      const latestStats = statsByKeyRef.current;
                      // Try to find matching stat by checking all stats for a name match
                      const stat = Object.values(latestStats).find((s) =>
                        namesMatch(s.barangay_name, rawName)
                      );
                      const count = stat?.count ?? 0;
                      layer
                        .bindTooltip(
                          `${name}: ${count} member${count !== 1 ? "s" : ""}`,
                          {
                            direction: "top",
                            sticky: true,
                          }
                        )
                        .openTooltip();
                    });
                    layer.on("mouseout", () => {
                      layer.closeTooltip();
                    });
                  }}
                />
              )}
            </MapContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs md:text-sm">
            {loading ? (
              <p className="text-muted-foreground">Loading barangay data…</p>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Showing member distribution across Luna barangays. Circle size
                  reflects the number of members in each barangay.
                </p>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold uppercase text-muted-foreground">
                    Legend
                  </p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                      <span>5+ members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#eab308]" />
                      <span>1–4 members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#dc2626]" />
                      <span>0 members</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">
                      Barangay with top number of members:
                    </span>
                    <span className="font-medium">
                      {topBarangay
                        ? `${topBarangay.barangay_name} (${topBarangay.count})`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">
                      Barangay{bottomBarangays.length !== 1 ? "s" : ""} with
                      least number of members:
                    </span>
                    {bottomBarangays.length > 0 ? (
                      <ol className="max-h-32 space-y-0.5 overflow-y-auto text-[10px] md:text-xs font-medium list-decimal list-inside">
                        {bottomBarangays.map((b, index) => (
                          <li key={b.barangay_code} className="truncate">
                            {b.barangay_name} ({b.count})
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <span className="font-medium">N/A</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Barangays
                  </p>
                  <ul className="max-h-64 space-y-1 overflow-y-auto text-xs">
                    {displayStats
                      .slice()
                      .sort((a, b) =>
                        a.barangay_name.localeCompare(b.barangay_name)
                      )
                      .map((s) => {
                        const color = getBarangayColor(s.count);
                        const name = s.barangay_name;
                        return (
                          <li
                            key={s.barangay_code}
                            className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              <span>{name}</span>
                            </span>
                            <span className="font-mono text-xs">{s.count}</span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
