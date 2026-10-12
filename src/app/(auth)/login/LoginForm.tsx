"use client";

import { useActionState } from "react";
import { loginAction, type loginState } from "../action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";

export function LoginForm() {
    const [state, formAction, pending] = useActionState<loginState, FormData>(
        loginAction,
        undefined,
    );

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                />
            </div>

            {state?.error && (
                <p role="alert" className="text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Signing in..." : "Sign in"}
            </Button>
        </form>
    );
}