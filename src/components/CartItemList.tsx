"use client";

import { useState } from "react";
import { updateCartQuantity, removeCartItem } from "@/lib/cart-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CartItem {
    id: string;
    name: string;
    pricePaise: number;
    quantity: number;
}

export function CartItemList({ initialItems }: { initialItems: CartItem[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const handleQuantityChange = async (id: string, delta: number) => {
        try {
            setLoadingId(id);
            const res = await updateCartQuantity(id, delta);
            if (res && res.error) {
                toast.error(res.error);
            } else {
                router.refresh(); // Yeh server se fresh data fetch karke automatically UI sync kar dega
            }
        } catch (error) {
            toast.error("Failed to update quantity");
        } finally {
            setLoadingId(null);
        }
    };

    const handleRemove = async (id: string, name: string) => {
        try {
            setLoadingId(id);
            const res = await removeCartItem(id);
            if (res && res.error) {
                toast.error(res.error);
            } else {
                toast.success(`${name} removed from cart`);
                router.refresh(); // Fresh data sync
            }
        } catch (error) {
            toast.error("Failed to remove item");
        } finally {
            setLoadingId(null);
        }
    };

    if (initialItems.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            {initialItems.map((item) => {
                const itemTotal = (item.pricePaise * item.quantity) / 100;
                const isItemLoading = loadingId === item.id;

                return (
                    <Card key={item.id} className="flex w-full flex-row items-center justify-between gap-4 p-4">
                        {/* Item Info */}
                        <div className="min-w-0 flex-1">
                            <h4 className="text-base font-semibold">{item.name}</h4>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                ₹{(item.pricePaise / 100).toFixed(2)} each
                            </p>
                        </div>

                        {/* Quantity Controls (+ / -) */}
                        <div className="flex shrink-0 items-center gap-3 rounded-lg border bg-muted/50 px-2 py-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={isItemLoading}
                                onClick={() => handleQuantityChange(item.id, -1)}
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </Button>

                            <span className="font-semibold text-sm w-4 text-center">
                                {item.quantity}
                            </span>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={isItemLoading}
                                onClick={() => handleQuantityChange(item.id, 1)}
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        {/* Total Price for this Item */}
                        <div className="min-w-[90px] shrink-0 text-right">
                            <span className="text-base font-bold">₹{itemTotal.toFixed(2)}</span>
                        </div>

                        {/* Delete Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isItemLoading}
                            onClick={() => handleRemove(item.id, item.name)}
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </Card>
                );
            })}
        </div>
    );
}