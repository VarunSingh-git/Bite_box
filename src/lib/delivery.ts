import { prisma } from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*  CONFIG – every pricing number lives here, nowhere else.                   */
/* -------------------------------------------------------------------------- */
export const DELIVERY_CONFIG = {
    // Item total >= ₹120  →  delivery is shown as FREE at any distance.
    FREE_MIN_CART_PAISE: 120 * 100,
    FREE_ZONE_KM: 2.0, // inside this, a ₹120+ order pays nothing extra

    // Beyond this we do not deliver at all.
    MAX_DELIVERY_KM: 10,

    // Rider cost per extra km (beyond the first 2 km)
    COVERED_KM: 2.0,
    RATE_NORMAL: { min: 7, max: 8 },
    RATE_SURGE: { min: 12, max: 13 }, // 11 PM – 6 AM, or bad weather
    RATE_RAMP_KM: 4,
    NIGHT_START_HOUR: 23,
    NIGHT_END_HOUR: 6,

    // Platform / handling component (whole rupees, ₹10–₹30)
    SHORT_MAX_KM: 2.6,
    MEDIUM_MAX_KM: 4.0,
    PLATFORM: {
        MIN: 10,
        MAX: 30,
        BASE: { short: 10, medium: 13, long: 16 },
        NIGHT_ADD: 5,
        WEATHER_ADD: 5,
        LARGE_ORDER_PAISE: 150 * 100,
        LARGE_ORDER_RELIEF: 2,
        MAX_SHARE_OF_CART: 0.15,
    },
} as const;

type DistanceBand = "short" | "medium" | "long";

interface DeliveryFeeParams {
    distanceKm: number;
    cartTotalPaise: number;
    orderHour?: number; // 0-23 in IST
    isBadWeather?: boolean;
}

export interface DeliveryBreakdown {
    distanceKm: number;
    cartTotalPaise: number;
    isDeliverable: boolean;
    isNight: boolean;
    isBadWeather: boolean;
    deliveryFeePaise: number;
    smallOrderFeePaise: number; // handling & platform fee
    savedPaise: number;
    isFreeDelivery: boolean;
    amountToFreePaise: number;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Current hour (0-23) in India, whatever time zone the server runs in. */
export function getCurrentHourIST(): number {
    const h = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hourCycle: "h23",
        timeZone: "Asia/Kolkata",
    }).format(new Date());
    return parseInt(h, 10);
}

export const formatPaise = (paise: number) => `₹${(paise / 100).toFixed(2)}`;

function bandFor(km: number): DistanceBand {
    if (km <= DELIVERY_CONFIG.SHORT_MAX_KM) return "short";
    if (km <= DELIVERY_CONFIG.MEDIUM_MAX_KM) return "medium";
    return "long";
}

function perKmRate(extraKm: number, surge: boolean): number {
    const { min, max } = surge ? DELIVERY_CONFIG.RATE_SURGE : DELIVERY_CONFIG.RATE_NORMAL;
    const t = clamp(extraKm / DELIVERY_CONFIG.RATE_RAMP_KM, 0, 1);
    return round2(min + (max - min) * t);
}

/* -------------------------------------------------------------------------- */
/*  Main calculator                                                           */
/* -------------------------------------------------------------------------- */
export function calculateDeliveryFee({
    distanceKm: rawDistanceKm,
    cartTotalPaise,
    orderHour = getCurrentHourIST(),
    isBadWeather = false,
}: DeliveryFeeParams): DeliveryBreakdown {
    const C = DELIVERY_CONFIG;
    const P = C.PLATFORM;

    const inputsValid =
        Number.isFinite(rawDistanceKm) &&
        rawDistanceKm >= 0 &&
        Number.isFinite(cartTotalPaise) &&
        cartTotalPaise >= 0;

    const distanceKm = inputsValid ? round2(rawDistanceKm) : 0;
    const isNight = orderHour >= C.NIGHT_START_HOUR || orderHour < C.NIGHT_END_HOUR;
    const isSurge = isNight || isBadWeather;
    const qualifiesForFree = cartTotalPaise >= C.FREE_MIN_CART_PAISE;
    const isDeliverable = inputsValid && distanceKm <= C.MAX_DELIVERY_KM;

    if (!isDeliverable) {
        return {
            distanceKm,
            cartTotalPaise,
            isDeliverable: false,
            isNight,
            isBadWeather,
            deliveryFeePaise: 0,
            smallOrderFeePaise: 0,
            savedPaise: 0,
            isFreeDelivery: false,
            amountToFreePaise: 0,
        };
    }

    /* 1. Real distance cost (rider cost beyond the first 2 km), whole rupees */
    const extraKm = Math.max(0, round2(distanceKm - C.COVERED_KM));
    const ratePerKm = extraKm > 0 ? perKmRate(extraKm, isSurge) : 0;
    const distanceChargeRupees = Math.round(extraKm * ratePerKm);

    /* 2. Platform / handling component, whole rupees (₹10–₹30) */
    let platformRupees: number = P.BASE[bandFor(distanceKm)];
    if (isNight) platformRupees += P.NIGHT_ADD;
    if (isBadWeather) platformRupees += P.WEATHER_ADD;
    if (cartTotalPaise >= P.LARGE_ORDER_PAISE && bandFor(distanceKm) !== "short") {
        platformRupees -= P.LARGE_ORDER_RELIEF;
    }
    const platformCap = Math.max(P.MIN, Math.round((cartTotalPaise / 100) * P.MAX_SHARE_OF_CART));
    platformRupees = clamp(Math.min(platformRupees, platformCap), P.MIN, P.MAX);

    /* 3. Who pays what */
    let deliveryFeeRupees: number;
    let handlingRupees: number;

    if (!qualifiesForFree) {
        // Under ₹120: normal delivery charge + platform fee
        deliveryFeeRupees = distanceChargeRupees;
        handlingRupees = platformRupees;
    } else {
        // ₹120+: delivery shows FREE. The real distance cost is recovered inside the
        // handling fee. The platform part fades in smoothly between 2.0 km and 2.6 km,
        // so there is no sudden price jump when crossing 2 km.
        const fadeIn = clamp(
            (distanceKm - C.FREE_ZONE_KM) / (C.SHORT_MAX_KM - C.FREE_ZONE_KM),
            0,
            1
        );
        deliveryFeeRupees = 0;
        handlingRupees = Math.round(platformRupees * fadeIn + distanceChargeRupees);
    }

    const normalFeesRupees = distanceChargeRupees + platformRupees;
    const paidRupees = deliveryFeeRupees + handlingRupees;

    return {
        distanceKm,
        cartTotalPaise,
        isDeliverable: true,
        isNight,
        isBadWeather,
        deliveryFeePaise: deliveryFeeRupees * 100,
        smallOrderFeePaise: handlingRupees * 100,
        savedPaise: qualifiesForFree ? Math.max(0, normalFeesRupees - paidRupees) * 100 : 0,
        isFreeDelivery: qualifiesForFree,
        amountToFreePaise: qualifiesForFree ? 0 : C.FREE_MIN_CART_PAISE - cartTotalPaise,
    };
}

/* -------------------------------------------------------------------------- */
/*  Distance helpers (server only – never send coordinates to the browser)    */
/* -------------------------------------------------------------------------- */
export async function getRestaurantDistanceKm(
    restaurantId: string,
    userLat: number,
    userLng: number
): Promise<number | null> {
    try {
        type DistanceResult = { distance_km: number };
        const result = await prisma.$queryRaw<DistanceResult[]>`
            SELECT ST_Distance(
                ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography,
                COALESCE(location, ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography)
            ) / 1000 AS distance_km
            FROM "Restaurant"
            WHERE id = ${restaurantId};
        `;
        const d = result[0]?.distance_km;
        return d == null ? null : Number(d);
    } catch (error) {
        console.error("Error calculating spatial distance:", error);
        return null; // never invent a distance – callers must handle null
    }
}

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}