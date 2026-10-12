import { z } from "zod"

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),

    // it's should be 32 char long cuz it generated using - (openssl rand -base64 32)
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    // optional, cuz google login is optional
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),

    // Test-mode safety: refuse live Razorpay keys.
    RAZORPAY_KEY_ID: z.string().startsWith("rzp_test_", "Use a razorpay test key (rzp_test_...)"),
    RAZORPAY_KEY_SECRET: z.string().min(1),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().startsWith("rzp_test_"),
    NEXT_PUBLIC_APP_URL: z.url()
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => ` - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")

    throw new Error(`Invalid environment variables \n${problems}`)
}

export const env = parsed.data