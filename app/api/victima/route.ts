// app/api/victima/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener todas las víctimas
export async function GET() {
  try {
    const victimas = await prisma.victima.findMany({
      include: {
        nacionalidad: {
          select: {
            id: true,
            nombre: true,
          }
        },
        causas: {
          include: {
            causa: {
              select: {
                id: true,
                ruc: true,
                denominacionCausa: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json(victimas);
  } catch (error) {
    console.error('Error fetching victimas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva víctima
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validaciones básicas
    if (!data.nombreVictima || !data.docId) {
      return NextResponse.json(
        { error: 'Nombre de víctima y documento son requeridos' },
        { status: 400 }
      );
    }

    // ✅ CREAR VÍCTIMA - solo con campos que existen en el modelo
    const nuevaVictima = await prisma.victima.create({
      data: {
        nombreVictima: data.nombreVictima,
        docId: data.docId,
        nacionalidadId: data.nacionalidadId ? parseInt(data.nacionalidadId) : null,
        // REMOVIDOS: alias y caracteristicas (no existen en Victima)
      },
      include: {
        nacionalidad: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    });

    return NextResponse.json(nuevaVictima, { status: 201 });
  } catch (error) {
    console.error('Error creating victima:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar víctima existente
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de víctima es requerido' },
        { status: 400 }
      );
    }

    const victimaId = parseInt(id);
    if (isNaN(victimaId)) {
      return NextResponse.json(
        { error: 'ID de víctima inválido' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // ✅ ACTUALIZAR VÍCTIMA - solo con campos que existen en el modelo
    const victimaActualizada = await prisma.victima.update({
      where: { id: victimaId },
      data: {
        nombreVictima: data.nombreVictima,
        docId: data.docId,
        nacionalidadId: data.nacionalidadId ? parseInt(data.nacionalidadId) : null,
        // REMOVIDOS: alias y caracteristicas (no existen en Victima)
      },
      include: {
        nacionalidad: {
          select: {
            id: true,
            nombre: true,
          }
        }
      }
    });

    return NextResponse.json(victimaActualizada);
  } catch (error) {
    console.error('Error updating victima:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Víctima no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar víctima
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de víctima es requerido' },
        { status: 400 }
      );
    }

    const victimaId = parseInt(id);
    if (isNaN(victimaId)) {
      return NextResponse.json(
        { error: 'ID de víctima inválido' },
        { status: 400 }
      );
    }

    await prisma.victima.delete({
      where: { id: victimaId }
    });

    return NextResponse.json({ message: 'Víctima eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting victima:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Víctima no encontrada' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}