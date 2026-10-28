// src/app/restaurants/page.tsx
import { Suspense } from "react";
import { getNearbyRestaurants, NearByRestaurants } from "@/lib/nearby";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationDetector } from "./location-detector";
import { Skeleton } from "@/components/ui/skeleton";

export default async function RestaurantsPage({
    searchParams,
}: {
    searchParams: Promise<{ lat?: string; lng?: string }>;
}) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nearby Home Kitchens</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Showing fresh home-cooked meals within 10 km
                    </p>
                </div>
            </div>

            <Suspense fallback={<div className="h-12 bg-muted/50 rounded-lg animate-pulse mb-6" />}>
                <LocationDetector />
            </Suspense>

            {/* Passing searchParams promise directly to a Suspense-wrapped async component */}
            <Suspense fallback={<RestaurantsSkeleton />}>
                <RestaurantList searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function RestaurantList({
    searchParams,
}: {
    searchParams: Promise<{ lat?: string; lng?: string }>;
}) {
    const params = await searchParams;
    const lat = params.lat ? parseFloat(params.lat) : 30.64;
    const lng = params.lng ? parseFloat(params.lng) : 76.72;

    const restaurants = await getNearbyRestaurants(lat, lng, 10000);
    if (restaurants.length === 0) {
        return (
            <div className="text-center py-16 border rounded-xl bg-card">
                <p className="text-muted-foreground">No open kitchens found near this location. Try clicking "Detect Location" or make sure kitchens are open!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r: NearByRestaurants) => {
                const distanceKm = (r.distanceMeters / 1000).toFixed(1);
                return (
                    <Card key={r.id} className="flex flex-col justify-between overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-bold">{r.name}</CardTitle>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                                    {r.cuisine}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5" /> {r.address || "Local Area"} ({distanceKm} km away)
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-0">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> ~{r.avgPrepMins} mins prep
                                </span>
                            </div>

                            <Link href={`/restaurants/${r.id}`} className="block w-full">
                                <Button className="w-full gap-2" variant="default" size="sm">
                                    <Utensils className="w-4 h-4" /> View Menu & Order
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function RestaurantsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border rounded-xl space-y-4 bg-card">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
    );
}