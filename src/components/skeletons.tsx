import { Skeleton } from "@/components/ui/skeleton";

// Home page: login status ki jagah
export function AuthStatusSkeleton() {
    return (
        <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-24" />
        </div>
    );
}

// Login / Register: card ki jagah
export function FormCardSkeleton() {
    return (
        <div className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
        </div>
    );
}

// Owner dashboard: kitchens ki list ki jagah
export function RestaurantCardsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-3 rounded-xl border bg-white p-4">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-8 w-28" />
                </div>
            ))}
        </div>
    );
}