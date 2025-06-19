import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('term') || '';

    // Si no hay término de búsqueda, devolver un array vacío
    if (!searchTerm.trim()) {
      return NextResponse.json([]);
    }

    // Buscar causas que coincidan con el RUC o denominación
    const causas = await prisma.causa.findMany({
      where: {
        OR: [
          { ruc: { contains: searchTerm, mode: 'insensitive' } },
          { denominacionCausa: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        ruc: true,
        denominacionCausa: true,
        delito: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      take: 10 // Limitar resultados
    });

    return NextResponse.json(causas);
  } catch (error) {
    console.error('Error al buscar causas:', error);
    return NextResponse.json(
      { error: 'Error al buscar causas' },
      { status: 500 }
    );
  }
}