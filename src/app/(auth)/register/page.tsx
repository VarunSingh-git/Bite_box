import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "./RegisterForm";
import { AuthStatusSkeleton } from "@/components/skeletons";

async function RegisterContent() {
    const session = await auth();
    if (session?.user) redirect("/");

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-orange-600">Create account</CardTitle>
                <CardDescription>Join to order or to sell home-cooked food.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RegisterForm />
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-orange-600 underline">
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-orange-50 p-6">
            <Suspense fallback={<AuthStatusSkeleton />}>
                <RegisterContent />
            </Suspense>
        </main>
    );
}