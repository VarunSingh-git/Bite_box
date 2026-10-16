"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react";


export function LocationDetector() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const hasLatLong = searchParams.has("lat") && searchParams.has("lng")

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            return
        }

        setLoading(true),
            setError(null)

        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            setLoading(false)
            router.push(`/restaurants?lat=${lat}&lng=${lng}`)
        },
        (err) => {
            setLoading(false);
            setError("Unable to retrieve your location. Using default location.");
            console.error(err);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    // Automatically try detecting on first load if lat/lng are missing
    useEffect(() => {
        if (!hasLatLong) {
            detectLocation();
        }
    }, [hasLatLong]);
    return (
        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border mb-6">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 text-sm">
                {loading ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" /> Detecting your live location...
                    </span>
                ) : hasLatLong ? (
                    <span>Showing kitchens near your live GPS coordinates.</span>
                ) : (
                    <span className="text-muted-foreground">Location access needed to show nearby kitchens.</span>
                )}
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={detectLocation} disabled={loading} className="gap-2">
                <MapPin className="w-4 h-4" /> Detect Location
            </Button>
        </div>
    );
}