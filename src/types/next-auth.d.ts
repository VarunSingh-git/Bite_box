import type { DefaultSession } from 'next-auth'

export type AppRole = "CUSTOMER" | "OWNER" | "ADMIN"

declare module "next-auth" {
    // this is called module augmentation, we add some more extra fields, 
    // by default session.user has name, email, image so we inject here id or role too
    // so that we can use session?.user.role for RBAC.
    interface Session {
        user: {
            id: string
            role: AppRole
        } & DefaultSession['user']
    }

    // this is where we get user.role when user is authenticate
    interface User {
        role: AppRole
    }
}

declare module "@auth/core/jwt" {
    // same here we inject id and role in jswt payload
    interface JWT {
        id: string
        role: AppRole
    }
}