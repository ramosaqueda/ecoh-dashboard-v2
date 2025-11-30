import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const yearParam = searchParams.get('year');

        // 1. Filtro de Fecha (Año)
        let dateFilter = {};
        if (yearParam && yearParam !== 'todos') {
            const year = parseInt(yearParam);
            if (!isNaN(year)) {
                dateFilter = {
                    fechaDelHecho: {
                        gte: new Date(year, 0, 1),
                        lte: new Date(year, 11, 31, 23, 59, 59, 999)
                    }
                };
            }
        }

        // 2. Filtro de Origen (ECOH Elqui = 2, ECOH Limarí = 3)
        const ecohFilter = {
            origenCausaId: {
                in: [2, 3]
            }
        };

        // 3. Consultar causas
        const causas = await prisma.causa.findMany({
            where: {
                ...ecohFilter,
                ...dateFilter,
                delitoId: { not: null } // Asegurar que tenga delito
            },
            select: {
                id: true,
                constituyeSs: true,
                delito: {
                    select: {
                        nombre: true
                    }
                }
            }
        });

        // 4. Procesar y Agrupar Datos
        const statsByDelito: Record<string, { total: number; concurrencia: number; noConcurrencia: number }> = {};

        causas.forEach(causa => {
            const delitoNombre = causa.delito?.nombre || 'Sin Delito';

            if (!statsByDelito[delitoNombre]) {
                statsByDelito[delitoNombre] = { total: 0, concurrencia: 0, noConcurrencia: 0 };
            }

            statsByDelito[delitoNombre].total += 1;

            if (causa.constituyeSs) {
                statsByDelito[delitoNombre].concurrencia += 1;
            } else {
                statsByDelito[delitoNombre].noConcurrencia += 1;
            }
        });

        // 5. Formatear para el frontend
        const result = Object.entries(statsByDelito).map(([delito, stats]) => ({
            delito,
            total: stats.total,
            concurrencia: stats.concurrencia,
            noConcurrencia: stats.noConcurrencia
        }));

        // Ordenar por total descendente
        result.sort((a, b) => b.total - a.total);

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching ECOH concurrence stats:', error);
        return NextResponse.json(
            { error: 'Error fetching stats', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
