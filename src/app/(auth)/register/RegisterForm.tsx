"use client";

import { useActionState } from "react";
import { useState, useEffect } from "react";
import { registerAction, type registerState } from "../action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";
import { toast } from "sonner";


interface RegisterFormProps {
    formAction: (payload: FormData) => void;
    pending: boolean;
    state?: { error?: string };
}

export function RegisterForm() {
    const [state, formAction, pending] = useActionState<registerState, FormData>(
        registerAction,
        undefined,
    );
    const [lat, setLat] = useState<string>("");
    const [long, setLong] = useState<string>("");
    const [isDetecting, setIsDetecting] = useState(false);


    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported in your browser")
            return
        }

        setIsDetecting(true)
        navigator.geolocation.getCurrentPosition((position) => {
            setLat(position.coords.latitude.toString())
            setLong(position.coords.longitude.toString())
            setIsDetecting(false)
            toast.success("Location detected successfully")
        },
            (error) => {
                setIsDetecting(false)
                toast.error("Unable to review yout location, Please enter manually")
                console.log(error)
            },
            { enableHighAccuracy: true }
        )
    }
    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                />
                <p className="text-xs text-gray-500">At least 8 characters.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">I want to</Label>
                <select
                    id="role"
                    name="role"
                    defaultValue="CUSTOMER"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                    <option value="CUSTOMER">Order food</option>
                    <option value="OWNER">Sell food (kitchen owner)</option>
                </select>
            </div>

            {/* Auto-detect Location Section */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Your Delivery Location</label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                        className="w-full flex items-center gap-2"
                    >
                        {isDetecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <MapPin className="w-4 h-4 text-primary" />
                        )}
                        {isDetecting ? "Detecting..." : "Detect My Location"}
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label htmlFor="lat" className="text-xs text-muted-foreground">Latitude</Label>
                        <Input
                            id="lat"
                            name="lat"
                            value={lat}
                            onChange={(e) => setLat(e.target.value)}
                            placeholder="Latitude e.g. 30.7046"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="long" className="text-xs text-muted-foreground">Longitude</Label>
                        <Input
                            id="long"
                            name="long"
                            value={long}
                            onChange={(e) => setLong(e.target.value)}
                            placeholder="Longitude e.g. 76.7179"
                            required
                        />
                    </div>
                </div>
            </div>

            {state?.error && (
                <p role="alert" className="text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating account..." : "Create account"}
            </Button>
        </form>
    );
}
