/**
 * Returns true when it is raining / snowing / stormy / very windy at the given point.
 * Uses Open-Meteo (free, no API key). Cached for 10 minutes.
 * If the call fails or times out we return false, so checkout is never blocked by weather.
 */
export async function getIsBadWeather(lat: number, lng: number): Promise<boolean> {
    try {
        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
            `&current=precipitation,weather_code,wind_speed_10m`;

        const res = await fetch(url, {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(2500),
        });
        if (!res.ok) return false;

        const { current } = await res.json();
        const code: number = current?.weather_code ?? 0;

        const badCode =
            (code >= 51 && code <= 67) || // drizzle / rain
            (code >= 71 && code <= 77) || // snow
            (code >= 80 && code <= 86) || // showers
            code >= 95; //                   thunderstorm

        return (
            badCode ||
            (current?.precipitation ?? 0) >= 0.5 || // mm
            (current?.wind_speed_10m ?? 0) >= 40 //    km/h
        );
    } catch {
        return false;
    }
}