import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Obtener todas las causas asociadas a una organización
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const organizacionId = parseInt((await params).id);

    const causasAsociadas = await prisma.causaOrganizacion.findMany({
      where: {
        organizacionId
      },
      include: {
        causa: {
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
          }
        }
      },
      orderBy: {
        fechaAsociacion: 'desc'
      }
    });

    return NextResponse.json(causasAsociadas);
  } catch (error) {
    console.error('Error al obtener causas asociadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener causas asociadas' },
      { status: 500 }
    );
  }
}