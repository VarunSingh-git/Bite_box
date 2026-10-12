import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutAction } from "./(auth)/action";
import { Button } from "@/components/ui/button";
import { AuthStatusSkeleton } from "@/components/skeletons";

async function AuthStatus() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-700">
          Signed in as <strong>{session.user.name}</strong> ({session.user.role})
        </p>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* <Button asChild>
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/register">Register</Link>
      </Button> */}
      <Link href="/login" className="rounded-md bg-orange-600 px-4 py-2 text-white">Sign in</Link>
      <Link href="/register" className="rounded-md bg-orange-600 px-4 py-2 text-white">Register</Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-orange-50 p-6">
      <h1 className="text-4xl font-bold text-orange-600">Tiffin</h1>
      <p className="text-gray-600">Home-cooked food from kitchens near you.</p>
      <Suspense fallback={<AuthStatusSkeleton />}>
        <AuthStatus />
      </Suspense>
    </main>
  );
}