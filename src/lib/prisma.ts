// // this is prisma ORM client that is used in write queries
import { PrismaClient } from "../generated/client"
// // this is adpator i.e. used as bridge b/w node-pg and prisma client
import { PrismaPg } from "@prisma/adapter-pg";
// // this is connection pooler of node-postgres (pg)
import { Pool } from "pg";

// now pool and prisma client are globally available
// this is prevent to create new db connections again and again
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
    pool: Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is missing from environment variables");
}

const pool =
    globalForPrisma.pool ?? new Pool({ connectionString });


const adapter = new PrismaPg(pool);

// this is bridge b/w pg and prisma ORM
export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
}