// src/app/owner/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guards";
import { toggleOpenAction } from "./action";
import { getOwnerRestaurants } from "@/lib/queries";
import { PlusCircle, Utensils, Store } from "lucide-react";

export default async function OwnerPage() {
    const user = await requireRole("OWNER");

    // Fetch owner's kitchens
    const restaurants = await getOwnerRestaurants(user.id);

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Store className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">My Kitchens</h1>
                </div>
                <Link href="/owner/restaurants/new">
                    <Button className="gap-2">
                        <PlusCircle className="w-4 h-4" /> Add New Kitchen
                    </Button>
                </Link>
            </div>

            {restaurants.length === 0 ? (
                <div className="text-center py-16 border rounded-xl bg-card space-y-4">
                    <p className="text-muted-foreground">You have no kitchens yet. Add your first home kitchen to start selling!</p>
                    <Link href="/owner/restaurants/new">
                        <Button>Create Your First Kitchen</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {restaurants.map((r) => (
                        <div key={r.id} className="space-y-3 rounded-xl border bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">{r.name}</h2>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${r.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                        }`}
                                >
                                    {r.isOpen ? "Open 🟢" : "Closed 🔴"}
                                </span>
                            </div>

                            <p className="text-sm text-gray-600">{r.address}</p>
                            <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-700">Cuisine:</span> {r.cuisine.join(", ")} · <span className="font-medium text-gray-700">Prep time:</span> ~{r.avgPrepMins} mins
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t">
                                <form action={toggleOpenAction.bind(null, r.id)}>
                                    <Button
                                        type="submit"
                                        className={r.isOpen ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200" : "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {r.isOpen ? "Close kitchen" : "Open kitchen"}
                                    </Button>
                                </form>

                                <Link href={`/owner/restaurants/${r.id}/menu`}>
                                    <Button variant="default" size="sm" className="gap-2">
                                        <Utensils className="w-4 h-4" /> Manage Menu
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}