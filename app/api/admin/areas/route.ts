import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const areas = await prisma.area.findMany({
            where: {
                activo: true
            },
            orderBy: {
                nombre: 'asc'
            },
            select: {
                id: true,
                nombre: true
            }
        });

        return NextResponse.json(areas);
    } catch (error) {
        console.error('Error fetching areas:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
