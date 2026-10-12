import z from "zod";

export const loginSchema = z.object({
    email: z.string().toLowerCase().trim(),
    password: z.string().min(8).max(20)
})

export const registeredSchema = z.object({
    name: z.string().trim().min(2).max(40),
    email: z.string().toLowerCase().trim(),
    password: z.string().min(8).max(72),
    role: z.enum(["CUSTOMER", "OWNER"]).default("CUSTOMER")
})


export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registeredSchema>;
