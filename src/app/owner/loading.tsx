import { RestaurantCardsSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

// Next.js is file ko "owner" ke saare pages ke liye apne aap fallback banata hai
export default function OwnerLoading() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Skeleton className="h-8 w-56" />
      <RestaurantCardsSkeleton />
    </main>
  );
}