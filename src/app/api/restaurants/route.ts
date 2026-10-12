import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: { isActive: true },
            include: { menuItems: true },
        });

        return NextResponse.json(restaurants);
    } catch (error) {
        return NextResponse.json({ error: error || 'Failed to fetch' }, { status: 500, });
    }
}