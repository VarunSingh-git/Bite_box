import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { getCart } from "@/lib/cart";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { calculateDeliveryFee, getRestaurantDistanceKm, getCurrentHourIST, formatPaise } from "@/lib/delivery";
import { getIsBadWeather } from "@/lib/weather";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItemList } from "@/components/CartItemList";
import { DeliveryToast } from "@/components/DeliveryToast";
import { BillSummary } from "@/components/BillSummary";

/* -------------------------------------------------------------------------- */
/*  TEMPORARY SWITCH                                                          */
/*  false → uses the saved location if there is one, otherwise an ESTIMATE   */
/*          (PREVIEW_DISTANCE_KM). No weather call, never blocks the cart.    */
/*  true  → location is required + real weather. Turn on with checkout page.  */
/* -------------------------------------------------------------------------- */
const USE_LIVE_LOCATION = false as boolean;
const PREVIEW_DISTANCE_KM = 2.5;

// Same ~100 m rounding as lib/nearby.ts, so both pages measure from the same point.
const round3 = (n: number) => Math.round(n * 1000) / 1000;

type SearchParams = Promise<Record<string, string | undefined>>;

export default function CartPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-bold tracking-tight">Your Food Cart</h1>

            <Suspense fallback={<CartSkeleton />}>
                <CartContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function CartContent({ searchParams }: { searchParams: SearchParams }) {
    const session = await requireUser();
    if (!session?.id) {
        return <div className="py-10 text-center text-muted-foreground">Please login to view cart.</div>;
    }

    const cart = await getCart(session.id);

    // NOTE: kept as `cart.item` to match your existing Prisma relation name.
    if (!cart || !cart.item || cart.item.length === 0) {
        return (
            <div className="mx-auto max-w-md py-16 text-center">
                <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
                <p className="mb-6 text-muted-foreground">
                    Explore nearby kitchens and add delicious home-cooked meals!
                </p>
                <Link href="/restaurants">
                    <Button className="w-full">Browse Kitchens</Button>
                </Link>
            </div>
        );
    }

    const restaurant = cart.restaurantId
        ? await prisma.restaurant.findUnique({ where: { id: cart.restaurantId } })
        : null;

    const totalPaise = cart.item.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);

    const cuisineText = Array.isArray(restaurant?.cuisine)
        ? restaurant.cuisine.join(", ")
        : (restaurant?.cuisine ?? "");

    const header = (
        <>
            {restaurant && (
                <div className="mb-6 flex items-center justify-between rounded-xl border bg-secondary/50 p-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Ordering from</p>
                        <h3 className="text-lg font-bold">{restaurant.name}</h3>
                    </div>
                    {cuisineText && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {cuisineText}
                        </span>
                    )}
                </div>
            )}
            <CartItemList initialItems={cart.item} />
        </>
    );

    /* ---------------------------------------------------------------------- */
    /*  Where do distance / hour / weather come from?                         */
    /* ---------------------------------------------------------------------- */
    let distanceKm = PREVIEW_DISTANCE_KM;
    let orderHour = getCurrentHourIST();
    let isBadWeather = false;

    // Location saved by <LocationSaver /> on the restaurants page.
    // Reading a cookie is free, so the cart never waits for GPS.
    const cookieStore = await cookies();
    const savedLat = round3(parseFloat(cookieStore.get("user_lat")?.value ?? ""));
    const savedLng = round3(parseFloat(cookieStore.get("user_lng")?.value ?? ""));
    const hasSavedLocation = Number.isFinite(savedLat) && Number.isFinite(savedLng);

    if (USE_LIVE_LOCATION && (!hasSavedLocation || !restaurant)) {
        return (
            <>
                {header}
                <Card className="mb-6 space-y-3 p-6 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Item total</span>
                        <span>{formatPaise(totalPaise)}</span>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                            Share your location to see delivery charges.{" "}
                            <Link href="/restaurants" className="font-medium text-primary underline">
                                Detect location
                            </Link>
                        </span>
                    </div>
                </Card>
                <Button disabled className="w-full py-6 text-lg font-semibold">
                    Proceed to Checkout
                </Button>
            </>
        );
    }

    if (hasSavedLocation && restaurant) {
        const d = await getRestaurantDistanceKm(restaurant.id, savedLat, savedLng);
        if (d !== null) distanceKm = d;
        // Weather is an outside call, so it only runs in live mode.
        if (USE_LIVE_LOCATION) isBadWeather = await getIsBadWeather(savedLat, savedLng);
    }

    if (process.env.NODE_ENV !== "production") {
        // Development only – test any price from the URL:
        //   /cart?km=6.4   /cart?km=6.4&hour=23   /cart?km=6.4&rain=1
        const sp = await searchParams;
        const km = parseFloat(sp?.km ?? "");
        const hour = parseInt(sp?.hour ?? "", 10);
        if (Number.isFinite(km) && km >= 0) distanceKm = km;
        if (Number.isFinite(hour) && hour >= 0 && hour <= 23) orderHour = hour;
        if (sp?.rain === "1") isBadWeather = true;
    }

    const breakdown = calculateDeliveryFee({
        distanceKm,
        cartTotalPaise: totalPaise,
        orderHour,
        isBadWeather,
    });

    return (
        <>
            <DeliveryToast isFreeDelivery={breakdown.isFreeDelivery && breakdown.isDeliverable} />

            {header}

            <BillSummary b={breakdown} />

            {/* TODO: link to the checkout page, where the live location is taken
                and the final price is calculated on the server. */}
            <Button
                disabled={!breakdown.isDeliverable}
                className="flex w-full items-center justify-center gap-2 py-6 text-lg font-semibold"
            >
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
                Delivery charges are confirmed at checkout using your delivery location.
            </p>
        </>
    );
}

function CartSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
        </div>
    );
}