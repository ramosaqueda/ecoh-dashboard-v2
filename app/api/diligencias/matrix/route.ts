import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const fiscalId = searchParams.get('fiscalId');
    const causaId = searchParams.get('causaId');
    const skip = (page - 1) * limit;

    // 1. Fetch all parametric diligencias (columns)
    const diligencias = await prisma.diligenciaMinima.findMany({
      where: { activo: true },
      orderBy: { id: 'asc' },
    });

    // 2. Fetch causes (rows) with pagination
    const whereClause: any = {};
    if (fiscalId) {
      whereClause.fiscalId = parseInt(fiscalId);
    }
    if (causaId) {
      whereClause.id = parseInt(causaId);
    }

    const causes = await prisma.causa.findMany({
      take: limit,
      skip: skip,
      where: whereClause,
      orderBy: { id: 'desc' }, // Newest first
      select: {
        id: true,
        ruc: true,
        denominacionCausa: true,
        diligencias: {
          select: {
            diligenciaId: true,
            realizada: true,
            noNecesaria: true,
            fechaRealizacion: true,
            fechaReiteracion: true,
            observacion: true,
          }
        }
      }
    });

    const totalCausas = await prisma.causa.count({ where: whereClause });

    return NextResponse.json({
      diligencias,
      causas: causes,
      pagination: {
        page,
        limit,
        total: totalCausas,
        totalPages: Math.ceil(totalCausas / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching matrix data:', error);
    return NextResponse.json({ error: 'Error fetching matrix data' }, { status: 500 });
  }
}
