import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener genogramas recientes
export async function GET(request: NextRequest) {
  try {
    // Obtener los 10 genogramas más recientes
    const genogramas = await prisma.genograma.findMany({
      select: {
        id: true,
        rucCausa: true,
        createdAt: true,
        updatedAt: true,
        causa: {
          select: {
            id: true,
            denominacionCausa: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    // Formatear la respuesta
    const formattedGenogramas = genogramas.map(genograma => ({
      id: genograma.id,
      ruc: genograma.rucCausa,
      causaId: genograma.causa?.id,
      denominacion: genograma.causa?.denominacionCausa,
      fecha: genograma.updatedAt.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    return NextResponse.json({
      genogramas: formattedGenogramas
    });
  } catch (error) {
    console.error('Error al obtener genogramas recientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener genogramas recientes' },
      { status: 500 }
    );
  }
}