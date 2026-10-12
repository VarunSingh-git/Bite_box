import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";


// NextAuth provide us 4 things. i.e.
// handlers, auth, signIn, singOut
// handlers use for API routes like GET, POST
// auth is help us read session in server 
// signIn and signOut is use for server actions for login/logout


// signout()

export const { handlers, auth, signIn, signOut } = NextAuth({
    //  we tell nextJS which startgy we use in login or for session. we use jwt session not db session
    session: { strategy: "jwt" },
    // this is by default path of signIn page (frontend) 
    // i.e. src/app/login/page.tsx
    pages: { signIn: "/login" },

    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(raw) {
                // raw is object of incoming creadential
                const parsed = loginSchema.safeParse(raw);
                if (!parsed.success) return null;

                const user = await prisma.user.findUnique({
                    where: { email: parsed.data.email },
                });
                if (!user?.passwordHash) return null;

                const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
                if (!ok) return null;

                console.log("handlers from auth.ts --------------------------------------", handlers)
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
        // Reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET automatically.
        // Empty values are fine until we set up Google (optional).
        Google,
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Google users: create the DB user on first login
            if (account?.provider === "google" && user.email) {
                await prisma.user.upsert({
                    where: { email: user.email },
                    update: { image: user.image ?? undefined },
                    create: {
                        email: user.email,
                        name: user.name ?? "Google User",
                        image: user.image,
                        role: "CUSTOMER",
                    },
                });
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Runs at login: copy id and role into the token.
            if (user) {
                if (account?.provider === "google" && user.email) {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email },
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = dbUser.role;
                    }
                } else {
                    token.id = user.id as string;
                    token.role = user.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.role = token.role;
            return session;
        },
    },
});