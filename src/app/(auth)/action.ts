"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSchema, registeredSchema } from "@/lib/validators"
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export type registerState = { error?: string } | undefined;
export type loginState = { error?: string } | undefined;

export async function registerAction(
    _prev: registerState,
    formdata: FormData,
): Promise<registerState> {
    const parsed = await registeredSchema.safeParse({
        name: formdata.get('name'),
        email: formdata.get('email'),
        password: formdata.get('password'),
        // image: formdata.get('image'),
        role: formdata.get('role') ?? "CUSTOMER"
    })
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return { error: `${issue?.path.join(".")}: ${issue?.message}` };
    }

    const { name, email, password, role } = parsed?.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { error: "An account with this email is already exists" }

    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name, email, passwordHash, role } })

    redirect("/login?registered=1")
}

export async function loginAction(
    _prev: loginState,
    formData: FormData,
): Promise<loginState> {
    const parsed = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password')
    })

    if (!parsed?.success) return { error: "Enter a valid email and a password of 8+ characters" }

    try {
        await signIn("credentials", {
            email: parsed?.data?.email,
            password: parsed?.data?.password,
            redirectTo: '/'
        })
    }
    catch (error) {
        if (error instanceof AuthError) {
            return { error: "Invalid email and password" }
        }
        throw error
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" })
}