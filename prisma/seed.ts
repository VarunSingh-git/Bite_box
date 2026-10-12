import { AppRole } from "@/lib/guards"
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const DEMO_PASSWORD = "Password@123";

type SeedItem = {
    name: string;
    description: string;
    pricePaise: number;
    category: string;
    isVeg: boolean;
};

type SeedRestaurant = {
    id: string;
    name: string;
    description: string;
    address: string;
    lat: number;
    lng: number;
    cuisine: string[];
    isOpen: boolean;
    avgPrepMins: number;
    items: SeedItem[];
};

const restaurants: SeedRestaurant[] = [
    {
        id: "seed-rest-1",
        name: "Sharma Ji Ki Rasoi",
        description: "Homestyle North Indian thalis cooked fresh every day.",
        address: "Block A, Connaught Place, New Delhi",
        lat: 28.6315,
        lng: 77.2167,
        cuisine: ["North Indian", "Thali"],
        isOpen: true,
        avgPrepMins: 30,
        items: [
            {
                name: "Veg Thali",
                description: "Dal, sabzi, 3 roti, rice, salad",
                pricePaise: 14900,
                category: "Thali",
                isVeg: true,
            },
            {
                name: "Rajma Chawal",
                description: "Rajma curry with steamed rice",
                pricePaise: 12000,
                category: "Main Course",
                isVeg: true,
            },
            {
                name: "Butter Chicken",
                description: "Creamy tomato gravy, 2 roti",
                pricePaise: 22000,
                category: "Main Course",
                isVeg: false,
            },
            {
                name: "Gulab Jamun (2 pcs)",
                description: "Warm and syrupy",
                pricePaise: 6000,
                category: "Dessert",
                isVeg: true,
            },
        ],
    },
    {
        id: "seed-rest-2",
        name: "Amma's South Kitchen",
        description: "Dosa, idli and filter coffee, made the Chennai way.",
        address: "Saket, New Delhi",
        lat: 28.5245,
        lng: 77.2066,
        cuisine: ["South Indian"],
        isOpen: true,
        avgPrepMins: 25,
        items: [
            {
                name: "Masala Dosa",
                description: "Crisp dosa with potato filling",
                pricePaise: 11000,
                category: "Tiffin",
                isVeg: true,
            },
            {
                name: "Idli Sambar (4 pcs)",
                description: "Soft idlis with sambar and chutney",
                pricePaise: 9000,
                category: "Tiffin",
                isVeg: true,
            },
            {
                name: "Curd Rice",
                description: "Cooling curd rice with pickle",
                pricePaise: 8000,
                category: "Main Course",
                isVeg: true,
            },
            {
                name: "Filter Coffee",
                description: "Strong and frothy",
                pricePaise: 4000,
                category: "Drinks",
                isVeg: true,
            },
        ],
    },
    {
        id: "seed-rest-3",
        name: "Bengali Bhoj by Mitali",
        description: "Fish curry, luchi and mishti from a Bengali home kitchen.",
        address: "Lajpat Nagar, New Delhi",
        lat: 28.5677,
        lng: 77.2433,
        cuisine: ["Bengali"],
        isOpen: true,
        avgPrepMins: 40,
        items: [
            {
                name: "Fish Curry Rice",
                description: "Rohu in mustard gravy with rice",
                pricePaise: 24000,
                category: "Main Course",
                isVeg: false,
            },
            {
                name: "Luchi Aloo Dum",
                description: "4 luchi with aloo dum",
                pricePaise: 13000,
                category: "Main Course",
                isVeg: true,
            },
            {
                name: "Mishti Doi",
                description: "Sweet set curd",
                pricePaise: 7000,
                category: "Dessert",
                isVeg: true,
            },
        ],
    },
    {
        id: "seed-rest-4",
        name: "Punjabi Dhaba Tadka",
        description: "Parathas and lassi, currently closed for the day.",
        address: "Karol Bagh, New Delhi",
        lat: 28.6519,
        lng: 77.1909,
        cuisine: ["Punjabi"],
        isOpen: false,
        avgPrepMins: 20,
        items: [
            {
                name: "Aloo Paratha",
                description: "2 parathas with butter and curd",
                pricePaise: 10000,
                category: "Breakfast",
                isVeg: true,
            },
            {
                name: "Sweet Lassi",
                description: "Thick and chilled",
                pricePaise: 5000,
                category: "Drinks",
                isVeg: true,
            },
        ],
    },
    {
        id: "seed-rest-5",
        name: "Dwarka Home Biryani",
        description: "Slow-cooked dum biryani, far from the city centre.",
        address: "Sector 10, Dwarka, New Delhi",
        lat: 28.5921,
        lng: 77.046,
        cuisine: ["Biryani", "Mughlai"],
        isOpen: true,
        avgPrepMins: 45,
        items: [
            {
                name: "Chicken Dum Biryani",
                description: "Serves 1, with raita",
                pricePaise: 26000,
                category: "Biryani",
                isVeg: false,
            },
            {
                name: "Veg Biryani",
                description: "Serves 1, with raita",
                pricePaise: 18000,
                category: "Biryani",
                isVeg: true,
            },
        ],
    },
];

async function upsertUser(
    email: string,
    name: string,
    role: AppRole,
    passwordHash: string,
) {
    return prisma.user.upsert({
        where: { email },
        update: { name, role, passwordHash },
        create: { email, name, role, passwordHash },
    });
}

async function main() {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    await upsertUser(
        "admin@bitebox.test",
        "Admin",
        "ADMIN",
        passwordHash,
    );

    await upsertUser(
        "customer@bitebox.test",
        "Demo Customer",
        "CUSTOMER",
        passwordHash,
    );

    const owner = await upsertUser(
        "owner@bitebox.test",
        "Demo Owner",
        "OWNER",
        passwordHash,
    );

    for (const restaurant of restaurants) {
        const { items, lng, ...fields } = restaurant;

        // Map the seed's lng property to the schema's required long field.
        await prisma.restaurant.upsert({
            where: { id: restaurant.id },
            update: {
                ...fields,
                long: lng,
                ownerId: owner.id,
            },
            create: {
                ...fields,
                long: lng,
                ownerId: owner.id,
            },
        });

        // PostGIS uses longitude first, then latitude.
        await prisma.$executeRaw`
      UPDATE "Restaurant"
      SET "location" =
        ST_SetSRID(
          ST_MakePoint(
            ${restaurant.lng}::float8,
            ${restaurant.lat}::float8
          ),
          4326
        )::geography
      WHERE "id" = ${restaurant.id}
    `;

        for (const [index, item] of items.entries()) {
            const id = `${restaurant.id}-item-${index + 1}`;

            await prisma.menuItems.upsert({
                where: { id },
                update: {
                    ...item,
                    restaurantId: restaurant.id,
                },
                create: {
                    id,
                    ...item,
                    restaurantId: restaurant.id,
                },
            });
        }
    }

    console.log(
        `Seeded 3 users, ${restaurants.length} restaurants, and their menu items.`,
    );
    console.log(`Demo login password for all users: ${DEMO_PASSWORD}`);
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });