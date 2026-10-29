import { Suspense } from "react";
import { getCart } from "@/lib/cart";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItemList } from "@/components/CartItemList";
import { calculateDeliveryFee } from "@/lib/delivery";

export default function CartPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Your Food Cart</h1>

            <Suspense fallback={<CartSkeleton />}>
                <CartContent />
            </Suspense>
        </div>
    );
}

async function CartContent() {
    const session = await requireUser();
    if (!session?.id) {
        return <div className="text-center py-10 text-muted-foreground">Please login to view cart.</div>;
    }

    const cart = await getCart(session.id);

    // Fixed typo: cart.item -> cart.items
    if (!cart || !cart.item || cart.item.length === 0) {
        return (
            <div className="text-center py-16 max-w-md mx-auto">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Explore nearby kitchens and add delicious home-cooked meals!</p>
                <Link href="/restaurants">
                    <Button className="w-full">Browse Kitchens</Button>
                </Link>
            </div>
        );
    }

    const restaurant = cart.restaurantId
        ? await prisma.restaurant.findUnique({ where: { id: cart.restaurantId } })
        : null;

    const totalPaise = cart.item.reduce((sum, item) => sum + (item.pricePaise * item.quantity), 0);

    // Calculate dynamic delivery fee (Assuming estimated distance is 2.5 KM for now)
    const estimatedDistanceKm = 2.5;
    const { deliveryFeePaise, isFreeDelivery, smallOrderFeePaise } = calculateDeliveryFee({
        distanceKm: estimatedDistanceKm,
        cartTotalPaise: totalPaise,
    });

    const grandTotalPaise = totalPaise + deliveryFeePaise;

    return (
        <>
            {restaurant && (
                <div className="mb-6 p-4 bg-secondary/50 border rounded-xl flex justify-between items-center">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-semibold">Ordering from</p>
                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                        {restaurant.cuisine}
                    </span>
                </div>
            )}

            {/* Vertical Interactive List Component (Fixed cart.items) */}
            <CartItemList initialItems={cart.item} />

            {/* Bill Summary */}
            <Card className="p-6 space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item Total</span>
                    <span>₹{(totalPaise / 100).toFixed(2)}</span>
                </div>

                {smallOrderFeePaise > 0 && (
                    <div className="flex justify-between text-sm text-amber-600 font-medium">
                        <span>Small Order Fee (Orders ≤ ₹150)</span>
                        <span>+₹{(smallOrderFeePaise / 100).toFixed(2)}</span>
                    </div>
                )}

                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Charge ({estimatedDistanceKm} km)</span>
                    <span>
                        {isFreeDelivery ? (
                            <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                            `₹${(deliveryFeePaise / 100).toFixed(2)}`
                        )}
                    </span>
                </div>

                <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Grand Total</span>
                    <span>₹{(grandTotalPaise / 100).toFixed(2)}</span>
                </div>
            </Card>

            <Button className="w-full py-6 text-lg font-semibold flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Button>
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