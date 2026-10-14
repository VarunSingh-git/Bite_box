"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { restaurantSchema } from "@/lib/validators";

export type RestaurantState = { error?: string } | undefined;

export async function createRestaurantAction(
    _prev: RestaurantState,
    formData: FormData,
): Promise<RestaurantState> {
    // 1. authentication based on role if role is not owner then redirect
    const user = await requireRole("OWNER");

    // 2. validate the Form data
    const parsed = restaurantSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description") ?? undefined,
        address: formData.get("address"),
        lat: formData.get("lat"),
        lng: formData.get("lng"),
        cuisine: formData.get("cuisine"),
        avgPrepMins: formData.get("avgPrepMins"),
    });

    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return { error: `${issue?.path.join(".")}: ${issue?.message}` };
    }
    console.log("parsed from owner/action.ts-----------------------", parsed)
    const { description, ...data } = parsed.data;

    // 3. create the restaurant + PostGIS filee the location
    //    Transaction means both tasks are done or both are rollback
    await prisma.$transaction(async (tx) => {
        const restaurant = await tx.restaurant.create({
            data: {
                name: data.name,
                description: description || null,
                address: data.address,
                lat: data.lat,
                long: data.lng,
                cuisine: data.cuisine,
                avgPrepMins: data.avgPrepMins,
                isOpen: true,
                ownerId: user.id,
            },
        });

        // first longitude, then latitude
        await tx.$executeRaw`
      UPDATE "Restaurant"
      SET "location" = ST_SetSRID(ST_MakePoint(${data.lng}::float8, ${data.lat}::float8), 4326)::geography
      WHERE "id" = ${restaurant.id}
    `;
    });

    revalidatePath("/owner"); // list refresh and delete cache so that udpated code should reflect on /owner
    redirect("/owner"); // redirect to /owner after refresh list or dlt cache
}

export async function toggleOpenAction(restaurantId: string) {
    const user = await requireRole("OWNER");

    // Ownership check: find only their own kitchen
    const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, ownerId: user.id }, 
        // user can chnge id: restaurantId using dev tool but ownerId: user.id comes from db session so result will be null if data mismatch occur
        select: { id: true, isOpen: true },
    });
    if (!restaurant) return;

    await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { isOpen: !restaurant.isOpen },
    });

    revalidatePath("/owner");
}