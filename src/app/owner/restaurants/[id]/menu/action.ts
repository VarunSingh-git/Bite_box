"use server"

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { menuItemSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createMenuItem(restaurantId: string, preState: any, formData: FormData) {
    const session = await auth();

    if (!session || session.user.role !== "OWNER") return { error: "Unauthorized" }

    const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, ownerId: session?.user?.id },
    })

    if (!restaurant) return { error: "Restaurant not found or unauthorized" }

    const rawData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        isVeg: formData.get('isVeg') === "true"
    }

    const parsed = menuItemSchema.safeParse(rawData);
    console.log("parsed from [id]/menu/action.ts -----------------------------", parsed)
    if (!parsed.success) return { error: parsed.error.issues[0].message }

    const { name, description, price, category, isVeg } = parsed.data

    // Convert Rupees to Integer Paise (Rule #1)
    const priceInPaise = Math.round(parseFloat(price) * 100)

    try {
        await prisma.menuItems.create({
            data: {
                restaurantId,
                name,
                description: description || null,
                pricePaise: priceInPaise,
                category,
                isVeg,
                isAvailable: true,
            }
        })

        revalidatePath("/owner/restaurants/{restaurantId}/menu")
        return { success: true, error: null }
    } catch (error) {
        console.error("Failed to create menu item:", error);
        return { error: "Database error while adding menu item" };
    }

}

export async function toggleMenuItemAction(restaurantId: string, menuItemId: string,) {
    const session = await auth();
    if (!session || session?.user.role !== "OWNER") {
        throw new Error("Unauthorized");
    }

    const restaurant = await prisma.restaurant.findFirst({
        where: {
            id: restaurantId, ownerId: session.user.id
        }
    })

    if (!restaurant) return { error: "Unauthorized" }

    const item = await prisma.menuItems.findUnique({
        where: { id: menuItemId }
    })

    if (!item || item.restaurantId !== restaurantId) throw new Error("Menu item not found");

    await prisma.menuItems.update({
        where: { id: menuItemId },
        data: { isAvailable: !item.isAvailable }
    })

    revalidatePath(`/owner/restaurants/${restaurantId}/menu`);
}

export async function deleteMenuItemAction(restaurantId: string, menuItemId: string) {
    const session = await auth();
    if (!session || session.user.role !== "OWNER") {
        throw new Error("Unauthorized");
    }

    const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, ownerId: session.user.id },
    });

    if (!restaurant) throw new Error("Unauthorized");

    await prisma.menuItems.delete({
        where: { id: menuItemId, restaurantId },
    });
    revalidatePath(`/owner/restaurants/${restaurantId}/menu`);
}