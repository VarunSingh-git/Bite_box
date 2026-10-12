import { NextResponse } from "next/server";
import { z } from "zod";
import { getApiUser } from "@/lib/guards";

type AppRole = "CUSTOMER" | "OWNER" | "ADMIN";

/** Throw this anywhere inside a handler to send a clean HTTP error. */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

/** Next.js uses thrown errors for redirect() and notFound(). Never swallow them. */
function isNextControlFlow(error: unknown): boolean {
    if (typeof error !== "object" || error === null) return false;
    const digest = (error as { digest?: unknown }).digest;
    return typeof digest === "string" && digest.startsWith("NEXT_");
}

/**
 * Wraps a route handler:
 * - ApiError  -> JSON with its status
 * - ZodError  -> 400 with the first problems
 * - redirect/notFound -> re-thrown untouched
 * - anything else -> logged on the server, generic 500 to the client
 */
export function withApi<Args extends unknown[]>(
    handler: (...args: Args) => Promise<Response> | Response,
) {
    return async (...args: Args): Promise<Response> => {
        try {
            return await handler(...args);
        } catch (error) {
            if (isNextControlFlow(error)) throw error;

            if (error instanceof ApiError) {
                return NextResponse.json({ error: error.message }, { status: error.status });
            }

            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    {
                        error: "Invalid input",
                        issues: error.issues.slice(0, 5).map((i) => ({
                            path: i.path.join("."),
                            message: i.message,
                        })),
                    },
                    { status: 400 },
                );
            }

            // Never leak internal error text (DB errors, stack traces) to the client.
            console.error("Unhandled API error:", error);
            return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
        }
    };
}

/** Session check for route handlers (rule 8). Throws 401 if not signed in. */
export async function requireApiUser() {
    const user = await getApiUser();
    if (!user) throw new ApiError(401, "Please sign in");
    return user;
}

/** Session + role check. ADMIN is always allowed. Throws 401 / 403. */
export async function requireApiRole(...roles: AppRole[]) {
    const user = await requireApiUser();
    if (user.role !== "ADMIN" && !roles.includes(user.role)) {
        throw new ApiError(403, "You are not allowed to do this");
    }
    return user;
}