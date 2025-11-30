import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ causaId: string }> }
) {
    const { causaId: causaIdStr } = await params;
    const causaId = parseInt(causaIdStr);

    if (isNaN(causaId)) {
        return NextResponse.json({ error: 'Invalid causaId' }, { status: 400 });
    }

    try {
        // 1. Fetch all parametric diligencias
        const diligenciasParametricas = await prisma.diligenciaMinima.findMany({
            where: { activo: true },
            orderBy: { id: 'asc' },
        });

        // 2. Fetch existing diligencias for this causa
        const diligenciasCausa = await prisma.causaDiligencia.findMany({
            where: { causaId: causaId },
        });

        // 3. Merge them
        const mergedDiligencias = diligenciasParametricas.map((param) => {
            const existing = diligenciasCausa.find((d) => d.diligenciaId === param.id);
            return {
                ...param,
                causaDiligencia: existing || null, // Include the relation if it exists
            };
        });

        return NextResponse.json(mergedDiligencias);
    } catch (error) {
        console.error('Error fetching diligencias for causa:', error);
        return NextResponse.json({ error: 'Error fetching diligencias for causa' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ causaId: string }> }
) {
    const { causaId: causaIdStr } = await params;
    const causaId = parseInt(causaIdStr);

    if (isNaN(causaId)) {
        return NextResponse.json({ error: 'Invalid causaId' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { diligenciaId, realizada, noNecesaria, fechaRealizacion, fechaReiteracion, observacion } = body;

        if (!diligenciaId) {
            return NextResponse.json({ error: 'diligenciaId is required' }, { status: 400 });
        }

        // Upsert the CausaDiligencia record
        const updatedDiligencia = await prisma.causaDiligencia.upsert({
            where: {
                causaId_diligenciaId: {
                    causaId: causaId,
                    diligenciaId: diligenciaId,
                },
            },
            update: {
                realizada: realizada !== undefined ? realizada : undefined,
                noNecesaria: noNecesaria !== undefined ? noNecesaria : undefined,
                fechaRealizacion: fechaRealizacion ? new Date(fechaRealizacion) : (fechaRealizacion === null ? null : undefined),
                fechaReiteracion: fechaReiteracion ? new Date(fechaReiteracion) : (fechaReiteracion === null ? null : undefined),
                observacion: observacion !== undefined ? observacion : undefined,
            },
            create: {
                causaId,
                diligenciaId,
                realizada: realizada || false,
                noNecesaria: noNecesaria || false,
                fechaRealizacion: fechaRealizacion ? new Date(fechaRealizacion) : null,
                fechaReiteracion: fechaReiteracion ? new Date(fechaReiteracion) : null,
                observacion,
            },
        });

        return NextResponse.json(updatedDiligencia);
    } catch (error) {
        console.error('Error updating diligencia for causa:', error);
        return NextResponse.json({ error: 'Error updating diligencia for causa' }, { status: 500 });
    }
}
