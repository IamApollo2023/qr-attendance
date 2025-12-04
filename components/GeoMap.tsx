// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { LUNA_CENTER } from "@/lib/luna-barangays";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import lunaGeo from "@/export.json";

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

function computeCentroids(geojson: any): Record<string, BarangayCentroid> {
  const centroids: Record<string, BarangayCentroid> = {};

  const features = geojson?.features ?? [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const geom = feature.geometry;

    const code: string | undefined = props.ref || props.old_ref;
    const name: string | undefined = props.name;
    if (!code || !name || !geom) continue;

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

    centroids[code] = {
      lat: sumLat / n,
      lng: sumLng / n,
      name,
    };
  }

  return centroids;
}

const LUNA_BARANGAY_CENTROIDS: Record<string, BarangayCentroid> =
  computeCentroids(lunaGeo);

export function GeoMap() {
  const [stats, setStats] = useState<BarangayStat[]>([]);
  const [loading, setLoading] = useState(true);

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
        const mapped: BarangayStat[] = data.map((d) => ({
          barangay_code: d.barangay_code,
          barangay_name: d.barangay_name,
          count: d.count,
        }));
        setStats(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const maxCount = useMemo(
    () => stats.reduce((max, s) => Math.max(max, s.count), 0),
    [stats]
  );

  const total = useMemo(
    () => stats.reduce((sum, s) => sum + s.count, 0),
    [stats]
  );

  const getRadius = (count: number) => {
    if (!maxCount) return 6;
    const minR = 6;
    const maxR = 20;
    return minR + (count / maxCount || 0) * (maxR - minR);
  };

  return (
    <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card className="flex min-h-[320px] flex-1 flex-col overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Members per barangay (Luna, La Union)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-full p-0">
          <MapContainer
            center={LUNA_CENTER}
            zoom={13}
            scrollWheelZoom={false}
            className="h-[360px] w-full md:h-full"
            maxBounds={[
              [LUNA_CENTER[0] - 0.08, LUNA_CENTER[1] - 0.08],
              [LUNA_CENTER[0] + 0.08, LUNA_CENTER[1] + 0.08],
            ]}
            maxBoundsViscosity={1}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {stats.map((s) => {
              const centroid = LUNA_BARANGAY_CENTROIDS[s.barangay_code];
              if (!centroid) return null;
              return (
                <CircleMarker
                  key={s.barangay_code}
                  center={[centroid.lat, centroid.lng]}
                  radius={getRadius(s.count)}
                  pathOptions={{
                    color: "rgba(91,132,173,1)",
                    fillColor: "rgba(91,132,173,0.7)",
                    fillOpacity: 0.7,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                    <div className="text-xs">
                      <div className="font-semibold">
                        {centroid.name || s.barangay_name}
                      </div>
                      <div>
                        {s.count} member{s.count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {loading ? (
            <p className="text-muted-foreground">Loading barangay data…</p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Showing member distribution across Luna barangays. Circle size
                reflects the number of members in each barangay.
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Total barangays represented</span>
                  <span className="font-medium">{stats.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total members mapped</span>
                  <span className="font-medium">{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max members in a barangay</span>
                  <span className="font-medium">{maxCount}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Barangays
                </p>
                <ul className="max-h-64 space-y-1 overflow-y-auto text-xs">
                  {stats
                    .slice()
                    .sort((a, b) =>
                      a.barangay_name.localeCompare(b.barangay_name)
                    )
                    .map((s) => {
                      const centroid = LUNA_BARANGAY_CENTROIDS[s.barangay_code];
                      const name = centroid?.name || s.barangay_name;
                      return (
                        <li
                          key={s.barangay_code}
                          className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-muted"
                        >
                          <span>{name}</span>
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
  );
}
