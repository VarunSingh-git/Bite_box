import { prisma } from "./prisma";
import { redis } from "./redis";

export interface NearByRestaurants {
    id: string;
    name: string;
    address: string | null;
    cuisine: string;
    avgPrepMins: number;
    lat: number;
    long: number;
    distanceMeters: number;
}

export async function getNearbyRestaurants(lat: number, long: number, radiusMeter: number = 5000)
// :Promise<NearByRestaurants[]>
{// Rule 5: Rounded lat/lng grid key for caching (approx ~100m grid precision)
    const latGrid = Math.round(lat * 1000) / 1000;
    const lngGrid = Math.round(long * 1000) / 1000;
    // Get version counter for invalidation when restaurant created/toggled

    const version = (await redis.get("nearby:version")) || "1"
    const cacheKey = `nearby:${latGrid}:${lngGrid}:${radiusMeter}:${version}`

    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // PostGIS Query using raw SQL (\$queryRaw)
    // Rule 3: Longitude FIRST in ST_MakePoint(lng, lat)

    const results = await prisma.$queryRaw<any[]>`
    SELECT 
      id, 
      name, 
      address, 
      cuisine, 
      "avgPrepMins", 
      lat, 
      long,
      ST_Distance(
        location, 
        ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)::geography
      ) AS "distanceMeters"
    FROM "Restaurant"
    WHERE "isOpen" = true
      AND ST_DWithin(
        location, 
        ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)::geography, 
        ${radiusMeter}
      )
    ORDER BY "distanceMeters" ASC;
  `;

    const formatted: NearByRestaurants[] = results.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        long: r.long,
        lat: r.lat,
        avgPrepMins: r.avgPrepMins,
        cuisine: r.cuisine,
        distanceMeters: Math.round(r.distanceMeters)
    }))

    // Store in Redis with TTL 60 seconds (Rule 5)
    // redis.setex() is used for set value with expiration time of key
    const storeInRedis = await redis.setex(cacheKey, 60, JSON.stringify(formatted))

    return formatted
}