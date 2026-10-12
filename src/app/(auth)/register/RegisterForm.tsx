"use client";

import { useActionState } from "react";
import { registerAction, type registerState } from "../action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";

export function RegisterForm() {
    const [state, formAction, pending] = useActionState<registerState, FormData>(
        registerAction,
        undefined,
    );

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                />
                <p className="text-xs text-gray-500">At least 8 characters.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">I want to</Label>
                <select
                    id="role"
                    name="role"
                    defaultValue="CUSTOMER"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                    <option value="CUSTOMER">Order food</option>
                    <option value="OWNER">Sell food (kitchen owner)</option>
                </select>
            </div>

            {state?.error && (
                <p role="alert" className="text-sm text-red-600">
                    {state.error}
                </p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Creating account..." : "Create account"}
            </Button>
        </form>
    );
}