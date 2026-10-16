// src/app/owner/restaurants/[id]/menu/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { MenuForm } from "./menu-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleMenuItemAvailability, deleteMenuItemAction } from "./action";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default async function OwnerMenuPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "OWNER") {
        redirect("/login");
    }

    const restaurant = await prisma.restaurant.findFirst({
        where: { id, ownerId: session.user.id },
        include: {
            menuItems: {
                orderBy: { category: "asc" },
            },
        },
    });

    if (!restaurant) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <Link href="/owner">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboards
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{restaurant.name} - Menu Management</h1>
            </div>

            <MenuForm restaurantId={restaurant.id} />

            <h2 className="text-xl font-semibold mb-4">Current Menu Items ({restaurant.menuItems.length})</h2>

            {restaurant.menuItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No dishes added yet. Add your first dish above!</p>
            ) : (
                <div className="space-y-4">
                    {restaurant.menuItems.map((item) => {
                        const priceInRupees = (item.pricePaise / 100).toFixed(2);
                        return (
                            <Card key={item.id} className="flex items-center justify-between p-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{item.isVeg ? "🟢" : "🔴"}</span>
                                        <h3 className="font-semibold text-lg">{item.name}</h3>
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                            {item.category}
                                        </span>
                                    </div>
                                    {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                                    <p className="font-medium mt-1">₹{priceInRupees}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <form
                                        action={async () => {
                                            "use server";
                                            await toggleMenuItemAvailability(restaurant.id, item.id);
                                        }}
                                    >
                                        <Button
                                            type="submit"
                                            variant={item.isAvailable ? "default" : "secondary"}
                                            size="sm"
                                        >
                                            {item.isAvailable ? "Available" : "Hidden"}
                                        </Button>
                                    </form>

                                    <form
                                        action={async () => {
                                            "use server";
                                            await deleteMenuItemAction(restaurant.id, item.id);
                                        }}
                                    >
                                        <Button type="submit" variant="destructive" size="icon" className="h-9 w-9">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}