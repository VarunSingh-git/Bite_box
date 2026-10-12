import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { RestaurantForm } from "./RestaurantForm";

export default async function NewRestaurantPage() {
    await requireRole("OWNER");

    return (
        <main className="mx-auto max-w-lg space-y-6 p-6">
            <div>
                <Link href="/owner" className="text-sm text-orange-600 underline">
                    ← Back to my kitchens
                </Link>
                <h1 className="mt-2 text-2xl font-bold text-orange-600">Add a kitchen</h1>
            </div>
            <RestaurantForm />
        </main>
    );
}