// src/app/restaurants/[id]/page.tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function RestaurantMenuPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/restaurants" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Nearby Kitchens
            </Link>

            {/* Passing params promise directly into a Suspense-wrapped async component */}
            <Suspense fallback={<MenuSkeleton />}>
                <RestaurantMenuContent params={params} />
            </Suspense>
        </div>
    );
}

// Async component that safely awaits params and fetches data inside Suspense
async function RestaurantMenuContent({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
        where: { id },
        include: {
            menuItems: {
                where: { isAvailable: true },
            },
        },
    });

    if (!restaurant) {
        notFound();
    }

    return (
        <>
            <div className="mb-8 border-b pb-6">
                <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
                <p className="text-muted-foreground mt-1">{restaurant.address || "Local Kitchen"}</p>
                <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                        {restaurant.cuisine}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">
                        ~{restaurant.avgPrepMins} mins prep
                    </span>
                </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Utensils className="w-6 h-6 text-primary" /> Menu Items
            </h2>

            {restaurant.menuItems.length === 0 ? (
                <div className="text-center py-12 border rounded-xl bg-card">
                    <p className="text-muted-foreground">No menu items available right now. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {restaurant.menuItems.map((item) => (
                        <Card key={item.id} className="flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center pt-2">
                                <span className="font-bold text-lg">
                                    ₹{(item.pricePaise / 100).toFixed(2)}
                                </span>
                                {/* <Button size="sm">Add to Cart</Button> */}
                                <AddToCartButton item={item}/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}

function MenuSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 border-b pb-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>

            <Skeleton className="h-7 w-36" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-5 border rounded-xl space-y-3 bg-card">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-9 w-24 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}