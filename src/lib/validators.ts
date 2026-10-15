import z from "zod";

export const loginSchema = z.object({
    email: z.email().toLowerCase().trim(),
    password: z.string().min(8).max(40)
})

export const registeredSchema = z.object({
    name: z.string().trim().min(2).max(40),
    email: z.email().toLowerCase().trim(),
    password: z.string().min(8).max(72),
    role: z.enum(["CUSTOMER", "OWNER"]).default("CUSTOMER")
})

export const restaurantSchema = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(300).optional(),
    address: z.string().trim().min(5).max(200),
    // corce convert text into numbers cuz lat, long is in number
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    // "North Indian, Thali" -> ["North Indian", "Thali"]
    cuisine: z
        .string()
        .transform((text) =>
            text
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean),
        )
        .pipe(z.array(z.string().max(30)).min(1, "Add at least one cuisine").max(5)),
    avgPrepMins: z.coerce.number().int().min(5).max(180),
});

export const menuItemSchema = z.object({
    name: z.string().min(2, "Dish name must be at least 2 characters"),
    description: z.string().optional(),
    // refine is used to add custom condition. 
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Price must be a valid positive number"
    }),
    category: z.string().min(2, "Category is required (e.g. Starter, Main course)"),
    isVeg: z.coerce.boolean(),
})

export type MenuItemSchema = z.infer<typeof menuItemSchema>
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registeredSchema>;
