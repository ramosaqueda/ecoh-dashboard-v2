// app/api/victima/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  createErrorResponse, 
  createSuccessResponse,
  createNotFoundResponse,
  createValidationErrorResponse,
  validateRequiredFields,
  parseQueryId
} from '@/lib/api-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseQueryId(searchParams.get('id'));

  try {
    if (id) {
      // Obtener una Victima específica
      const victima = await prisma.victima.findUnique({
        where: { id },
        include: {
          nacionalidad: true,
          causas: {
            include: {
              causa: true
            }
          }
        }
      });
      
      if (!victima) {
        return createNotFoundResponse('Victima', id);
      }
      
      return createSuccessResponse(victima);
    } else {
      // Obtener todas las Victimas
      const victimas = await prisma.victima.findMany({
        include: {
          nacionalidad: true,
          causas: {
            include: {
              causa: true
            }
          }
        }
      });
      return createSuccessResponse(victimas);
    }
  } catch (error) {
    return createErrorResponse('Error al obtener victima(s)', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validar campos requeridos
    const { isValid, missingFields } = validateRequiredFields(data, ['nombreVictima', 'docId']);
    if (!isValid) {
      return createValidationErrorResponse(missingFields);
    }

    const { nombreVictima, docId, nacionalidadId } = data;

    const victima = await prisma.victima.create({
      data: { 
        nombreVictima,
        docId,
        nacionalidadId: nacionalidadId ? Number(nacionalidadId) : null
      },
      include: {
        nacionalidad: true
      }
    });
    
    return createSuccessResponse(victima, 201, 'Victima creada exitosamente');
  } catch (error) {
    return createErrorResponse('Error al crear victima', error);
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseQueryId(searchParams.get('id'));

  if (!id) {
    return NextResponse.json(
      { message: 'Se requiere ID para actualizar' },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();
    
    // Validar campos requeridos
    const { isValid, missingFields } = validateRequiredFields(data, ['nombreVictima', 'docId']);
    if (!isValid) {
      return createValidationErrorResponse(missingFields);
    }

    const { nombreVictima, docId, nacionalidadId } = data;

    const victima = await prisma.victima.update({
      where: { id },
      data: { 
        nombreVictima,
        docId,
        nacionalidadId: nacionalidadId ? Number(nacionalidadId) : null
      },
      include: {
        nacionalidad: true
      }
    });
    
    return createSuccessResponse(victima, 200, 'Victima actualizada exitosamente');
  } catch (error) {
    return createErrorResponse('Error al actualizar victima', error);
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = parseQueryId(searchParams.get('id'));

  if (!id) {
    return NextResponse.json(
      { message: 'Se requiere ID para eliminar' },
      { status: 400 }
    );
  }

  try {
    // Verificar si la víctima existe
    const victima = await prisma.victima.findUnique({
      where: { id }
    });

    if (!victima) {
      return createNotFoundResponse('Victima', id);
    }

    await prisma.victima.delete({
      where: { id }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return createErrorResponse('Error al eliminar victima', error);
  }
}