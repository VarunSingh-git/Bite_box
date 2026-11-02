"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Reads ?lat=..&lng=.. from the URL (the same values the restaurants list uses)
 * and saves them in cookies so the cart measures from the very same point.
 * Renders nothing. Use it as: <Suspense fallback={null}><LocationSaver /></Suspense>
 */
export function LocationSaver() {
    const params = useSearchParams();
    const lat = parseFloat(params.get("lat") ?? "");
    const lng = parseFloat(params.get("lng") ?? "");

    useEffect(() => {
        const valid =
            Number.isFinite(lat) && Number.isFinite(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        if (!valid) return;
        const opts = "; path=/; max-age=86400; samesite=lax";
        document.cookie = `user_lat=${lat}${opts}`;
        document.cookie = `user_lng=${lng}${opts}`;
    }, [lat, lng]);

    return null;
}