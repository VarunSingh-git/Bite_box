import { RestaurantCardsSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

// this is by default fallback page for all pages of owner
export default function OwnerLoading() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Skeleton className="h-8 w-56" />
      <RestaurantCardsSkeleton />
    </main>
  );
}