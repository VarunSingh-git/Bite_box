import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";

type SearchParams = Promise<{ registered?: string }>;

async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
    const session = await auth();
    if (session?.user) redirect("/");

    const { registered } = await searchParams;

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl text-orange-600">Welcome back</CardTitle>
                <CardDescription>Sign in to order from kitchens near you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {registered && (
                    <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">
                        Account created. Please sign in.
                    </p>
                )}
                <LoginForm />
                <p className="text-center text-sm text-gray-600">
                    New here?{" "}
                    <Link href="/register" className="font-medium text-orange-600 underline">
                        Create an account
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-orange-50 p-6">
            <Suspense fallback={<p className="text-sm text-gray-500">Loading...</p>}>
                <LoginContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}