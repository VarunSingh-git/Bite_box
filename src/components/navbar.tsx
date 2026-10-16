// src/components/navbar.tsx
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, LogOut, User, Store } from "lucide-react";

async function UserNav() {
    const session = await auth();

    if (!session?.user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                    <Button size="sm">Register</Button>
                </Link>
            </div>

        );
    }

    return (
        <div className="flex items-center gap-3">
            {session.user.role === "OWNER" && (
                <Link href="/owner">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Store className="w-4 h-4" /> My Kitchens
                    </Button>
                </Link>
            )}

            <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-xs font-medium">
                <User className="w-3.5 h-3.5" />
                <span>{session.user.name || session.user.email}</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">
                    {session.user.role}
                </span>
            </div>

            <form
                action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                }}
            >
                <Button variant="ghost" size="sm" type="submit" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1">
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            </form>
        </div>
    );
}

// Navbar Skeleton Loader for Suspense fallback
function NavbarSkeleton() {
    return (
        <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
        </div>
    );
}

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* App Logo / Brand */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <span>Bite Box</span>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                        Home
                    </Link>

                    {/* Suspense with custom Skeleton fallback */}
                    <Suspense fallback={<NavbarSkeleton />}>
                        <UserNav />
                    </Suspense>
                </nav>
            </div>
        </header>
    );
}