import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AGREGADA: Verificación de autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado - sesión requerida' },
        { status: 401 }
      );
    }

    // Desestructura el Promise
    const params = await context.params;
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
            denominacionCausa: true
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
            id: true,
            email: true,
            nombre: true
          }
        },
        usuarioAsignado: {
          select: {
            id: true,
            email: true,
            nombre: true,
            rol: {
              select: {
                id: true,
                nombre: true
              }
            }
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
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
