import { prisma } from "./prisma";
import { redis } from "./redis";

// NOTE: kitchen coordinates are deliberately NOT part of this type.
// They stay on the server; the browser only ever gets the distance.
export interface NearByRestaurants {
  id: string;
  name: string;
  address: string | null;
  cuisine: string[];
  avgPrepMins: number;
  distanceMeters: number;
}

interface NearbyRow {
  id: string;
  name: string;
  address: string | null;
  cuisine: string[];
  avgPrepMins: number;
  distanceMeters: number;
}

const MAX_RADIUS_METERS = 10_000;
const DEFAULT_RADIUS_METERS = 5_000;
const CACHE_TTL_SECONDS = 60;
const VERSION_KEY = "nearby:version";

export async function getNearbyRestaurants(
  lat: number,
  long: number,
  radiusMeter: number = DEFAULT_RADIUS_METERS
): Promise<NearByRestaurants[]> {
  // Reject bad input instead of sending garbage to PostGIS
  if (
    !Number.isFinite(lat) || !Number.isFinite(long) ||
    lat < -90 || lat > 90 || long < -180 || long > 180
  ) {
    return [];
  }
  const radius = Number.isFinite(radiusMeter)
    ? Math.min(Math.max(radiusMeter, 100), MAX_RADIUS_METERS)
    : DEFAULT_RADIUS_METERS;

  // ~100 m grid. We query from the grid centre too, so every user in the same
  // grid cell gets the same (cached) result. Error is at most ~80 m.
  const latGrid = Math.round(lat * 1000) / 1000;
  const lngGrid = Math.round(long * 1000) / 1000;

  // Cache is a bonus: if Redis is down we still serve from the database.
  let cacheKey: string | null = null;
  try {
    const version = (await redis.get(VERSION_KEY)) || "1";
    cacheKey = `nearby:${latGrid}:${lngGrid}:${radius}:${version}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as NearByRestaurants[];
  } catch (error) {
    console.error("Nearby cache read failed:", error);
    cacheKey = null;
  }

  // Longitude FIRST in ST_MakePoint(lng, lat). lat/long columns are not selected.
  const rows = await prisma.$queryRaw<NearbyRow[]>`
        SELECT
            id,
            name,
            address,
            cuisine,
            "avgPrepMins",
            ST_Distance(
                location,
                ST_SetSRID(ST_MakePoint(${lngGrid}, ${latGrid}), 4326)::geography
            ) AS "distanceMeters"
        FROM "Restaurant"
        WHERE "isOpen" = true
          AND "isActive" = true
          AND ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(${lngGrid}, ${latGrid}), 4326)::geography,
                ${radius}
              )
        ORDER BY "distanceMeters" ASC;
    `;

  const formatted: NearByRestaurants[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    cuisine: r.cuisine,
    avgPrepMins: r.avgPrepMins,
    distanceMeters: Math.round(Number(r.distanceMeters)),
  }));

  if (cacheKey) {
    try {
      await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(formatted));
    } catch (error) {
      console.error("Nearby cache write failed:", error);
    }
  }

  return formatted;
}

/**
 * Call this whenever a kitchen is created, opened/closed, deactivated, or a mobile
 * kitchen updates its location. It makes every cached nearby list stale at once.
 */
export async function invalidateNearbyCache(): Promise<void> {
  try {
    await redis.incr(VERSION_KEY);
  } catch (error) {
    console.error("Nearby cache invalidation failed:", error);
  }
}