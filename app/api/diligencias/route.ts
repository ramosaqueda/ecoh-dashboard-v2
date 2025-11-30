import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this is where the prisma client is exported

export async function GET() {
    try {
        const diligencias = await prisma.diligenciaMinima.findMany({
            where: { activo: true },
            orderBy: { id: 'asc' },
        });
        return NextResponse.json(diligencias);
    } catch (error) {
        console.error('Error fetching diligencias:', error);
        return NextResponse.json({ error: 'Error fetching diligencias' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombre, descripcion } = body;

        if (!nombre) {
            return NextResponse.json({ error: 'Nombre is required' }, { status: 400 });
        }

        const nuevaDiligencia = await prisma.diligenciaMinima.create({
            data: {
                nombre,
                descripcion,
            },
        });

        return NextResponse.json(nuevaDiligencia, { status: 201 });
    } catch (error) {
        console.error('Error creating diligencia:', error);
        return NextResponse.json({ error: 'Error creating diligencia' }, { status: 500 });
    }
}
