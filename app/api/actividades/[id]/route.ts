// /app/api/actividades/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actividadId = parseInt(params.id);

    if (isNaN(actividadId)) {
      return NextResponse.json(
        { error: 'ID de actividad inválido' },
        { status: 400 }
      );
    }

    const actividad = await prisma.actividad.findUnique({
      where: {
        id: actividadId
      },
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacion: true
          }
        },
        tipoActividad: {
          select: {
            id: true,
            nombre: true
          }
        },
        usuario: {
          select: {
            email: true
          }
        }
      }
    });

    if (!actividad) {
      return NextResponse.json(
        { error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(actividad);

  } catch (error) {
    console.error('Error fetching actividad:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
