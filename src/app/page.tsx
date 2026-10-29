// src/app/page.tsx
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";



async function HomeContent() {
  const session = await auth();
  return (
    <div className="max-w-3xl space-y-6">
      <div className="inline-flex items-center gap-2 bg-black/10 text-black px-3 py-1 rounded-full text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" /> Homemade food, delivered hot to your doorstep
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
        Fresh & Hygienic Meals from <span className="text-primary">Home Kitchens</span>
      </h1>

      <p className="text-muted-foreground text-lg max-w-xl mx-auto">
        Discover local home cooks in your neighborhood, explore daily rotating menus, and enjoy wholesome food made with love.
      </p>

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        {session?.user ? (
          session.user.role === "OWNER" ? (
            <Link href="/owner">
              <Button size="lg" className="gap-2">
                <UtensilsCrossed className="w-5 h-5" /> Go to Kitchen Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/restaurants">
              <Button size="lg" className="gap-2">
                <MapPin className="w-5 h-5" /> Explore Nearby Kitchens
              </Button>
            </Link>
          )
        ) : (
          <>
            <Link href="/login">
              <Button size="lg">Login to Order</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">Create Account</Button>
            </Link>
          </>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
        <div className="p-5 rounded-xl border bg-card/50">
          <MapPin className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-base mb-1">Hyperlocal Search</h3>
          <p className="text-sm text-muted-foreground">Find kitchens active within your exact radius using PostGIS spatial queries.</p>
        </div>
        <div className="p-5 rounded-xl border bg-card/50">
          <UtensilsCrossed className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-base mb-1">Authentic Home Cooks</h3>
          <p className="text-sm text-muted-foreground">Directly support passionate home chefs preparing meals in clean environments.</p>
        </div>
        <div className="p-5 rounded-xl border bg-card/50">
          <ShieldCheck className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-base mb-1">Secure Payments</h3>
          <p className="text-sm text-muted-foreground">Integrated securely with Razorpay test mode and instant live status tracking.</p>
        </div>
      </div>
    </div>
  )
}


export default function Home() {

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center py-12">
      <Suspense fallback={
        <div className="space-y-4 w-full max-w-xl mx-auto">

          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-24 w-full" />

        </div>
      }>
        <HomeContent />
      </Suspense>
    </div>
  );
}