import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { toggleOpenAction } from "./action";

export default async function OwnerPage() {
    const user = await requireRole("OWNER");

    // only owner's new kitchen 
    const restaurants = await prisma.restaurant.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-orange-600">My kitchens</h1>
                <Link href="/owner/restaurants/new" className={buttonVariants()}>
                    Add kitchen
                </Link>
            </div>

            {restaurants.length === 0 && (
                <p className="text-gray-600">You have no kitchens yet. Add your first one.</p>
            )}

            <div className="space-y-4">
                {restaurants.map((r) => (
                    <div key={r.id} className="space-y-2 rounded-xl border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{r.name}</h2>
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs ${r.isOpen ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                                    }`}
                            >
                                {r.isOpen ? "Open" : "Closed"}
                            </span>
                        </div>

                        <p className="text-sm text-gray-600">{r.address}</p>
                        <p className="text-sm text-gray-500">
                            {r.cuisine.join(", ")} · ~{r.avgPrepMins} min
                        </p>

                        <form action={toggleOpenAction.bind(null, r.id)}>
                            <Button type="submit" variant="outline" size="sm">
                                {r.isOpen ? "Close kitchen" : "Open kitchen"}
                            </Button>
                        </form>
                    </div>
                ))}
            </div>
        </main>
    );
}