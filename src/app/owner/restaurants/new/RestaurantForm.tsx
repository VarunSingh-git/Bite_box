"use client";

import { useActionState, useState } from "react";
import { createRestaurantAction, type RestaurantState } from "@/app/owner/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RestaurantForm() {
    const [state, formAction, pending] = useActionState<RestaurantState, FormData>(
        createRestaurantAction,
        undefined,
    );

    // Har field state me, taaki error aane par form khaali na ho jaaye
    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        lat: "",
        lng: "",
        cuisine: "",
        avgPrepMins: "30",
    });
    const [geoError, setGeoError] = useState("");

    function update(field: keyof typeof form, value: string) {
        setForm((old) => ({ ...old, [field]: value }));
    }

    function useMyLocation() {
        setGeoError("");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                update("lat", position.coords.latitude.toFixed(6));
                update("lng", position.coords.longitude.toFixed(6));
            },
            () => setGeoError("Could not get your location. Type it in manually."),
        );
    }

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Kitchen name</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    name="address"
                    required
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Location</Label>
                    <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
                        Use my location
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        name="lat"
                        placeholder="Latitude (28.6139)"
                        required
                        inputMode="decimal"
                        value={form.lat}
                        onChange={(e) => update("lat", e.target.value)}
                    />
                    <Input
                        name="lng"
                        placeholder="Longitude (77.2090)"
                        required
                        inputMode="decimal"
                        value={form.lng}
                        onChange={(e) => update("lng", e.target.value)}
                    />
                </div>
                {geoError && <p className="text-xs text-red-600">{geoError}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine (comma separated)</Label>
                <Input
                    id="cuisine"
                    name="cuisine"
                    placeholder="North Indian, Thali"
                    required
                    value={form.cuisine}
                    onChange={(e) => update("cuisine", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="avgPrepMins">Average prep time (minutes)</Label>
                <Input
                    id="avgPrepMins"
                    name="avgPrepMins"
                    type="number"
                    min={5}
                    max={180}
                    required
                    value={form.avgPrepMins}
                    onChange={(e) => update("avgPrepMins", e.target.value)}
                />
            </div>

            {state?.error && (
                <p role="alert" className="text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Saving..." : "Create kitchen"}
            </Button>
        </form>
    );
}