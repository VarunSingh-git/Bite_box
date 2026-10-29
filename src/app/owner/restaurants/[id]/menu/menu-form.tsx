// src/app/owner/restaurants/[id]/menu/menu-form.tsx
"use client";

import { useActionState } from "react";
import { createMenuItem } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export function MenuForm({ restaurantId }: { restaurantId: string }) {
    const [state, formAction, isPending] = useActionState(
        createMenuItem.bind(null, restaurantId),
        { error: null, success: false }
    );

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> Add New Dish
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {state.error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Dish Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Paneer Butter Masala" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input id="price" name="price" type="number" step="0.01" placeholder="199" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                                id="category"
                                name="category"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue="true"
                            >
                                <option value="true">Starter</option>
                                <option value="false"> Main Course</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="isVeg">Dietary Type</Label>
                            <select
                                id="isVeg"
                                name="isVeg"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue="true"
                            >
                                <option value="true">Veg 🟢</option>
                                <option value="false">Non-Veg 🔴</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" name="description" placeholder="Short description of ingredients..." />
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Adding Dish..." : "Add Dish to Menu"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}