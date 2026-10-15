import { prisma } from "@/lib/prisma";

export function getOwnerRestaurants(ownerId: string) {
    return prisma.restaurant.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            address: true,
            cuisine: true,
            isOpen: true,
            avgPrepMins: true,
        },
    });
}