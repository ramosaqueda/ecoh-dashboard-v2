// src/app/api/actividades/causa/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Ahora params es una Promise
) {
  try {
    // ✅ Await the params before using them
    const { id } = await params;
    const causaId = parseInt(id);

    if (isNaN(causaId)) {
      return NextResponse.json(
        { message: 'ID de causa inválido' },
        { status: 400 }
      );
    }

    // Verificar si la causa existe
    const causa = await prisma.causa.findUnique({
      where: { id: causaId }
    });

    if (!causa) {
      return NextResponse.json(
        { message: 'Causa no encontrada' },
        { status: 404 }
      );
    }

    // Obtener todas las actividades relacionadas a la causa
    const actividades = await prisma.actividad.findMany({
      where: {
        causa_id: causaId
      },
      include: {
        causa: true,
        tipoActividad: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    });

    // Retornamos solo las actividades ya que el frontend espera un array de actividades
    return NextResponse.json(actividades);

  } catch (error) {
    console.error('Error en GET /api/actividades/causa/[id]:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}