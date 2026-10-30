import { redirect } from "next/navigation";
import { auth } from "./auth";

export type AppRole = "CUSTOMER" | "OWNER" | "ADMIN"

// for pages and server actions redirect to /login if not signed in.
export async function requireUser() {
    // auth is use for read session from server
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login')
    }

    return session?.user;
}

// like requireUser, but also check the role. admin role is allowed
export async function requireRole(...role: AppRole[]) {
    const user = await requireUser();
    if (user?.role !== "ADMIN" && !role.includes(user?.role)) {
        redirect("/")
    }
    return user;
}

// for api route handlers returns null instead of redirecting
export async function getApiUser() {
    const session = await auth();
    return session?.user?.id ? session?.user : null;
}