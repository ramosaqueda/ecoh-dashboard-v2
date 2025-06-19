import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Mejor manejo de la instancia de Prisma
const prisma = new PrismaClient();

// Función helper para manejar errores
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  return NextResponse.json(
    {
      message,
      error: error instanceof Error ? error.message : 'Error desconocido'
    },
    { status: 500 }
  );
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const foco = await prisma.foco.findUnique({
        where: { id: Number(id) }
      });

      if (!foco) {
        return NextResponse.json(
          { message: 'Foco no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(foco);
    }

    const focos = await prisma.foco.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(focos);
  } catch (error) {
    return handleError(error, 'Error al obtener foco(s)');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación de datos
    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const foco = await prisma.foco.create({
      data: {
        nombre: body.nombre.trim()
      }
    });

    return NextResponse.json(foco, { status: 201 });
  } catch (error) {
    return handleError(error, 'Error al crear foco');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    // Validaciones
    if (!id) {
      return NextResponse.json(
        { message: 'Se requiere ID para actualizar' },
        { status: 400 }
      );
    }

    if (!body.nombre?.trim()) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const foco = await prisma.foco.update({
      where: { id: Number(id) },
      data: {
        nombre: body.nombre.trim()
      }
    });

    return NextResponse.json(foco);
  } catch (error) {
    return handleError(error, 'Error al actualizar foco');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Se requiere ID para eliminar' },
        { status: 400 }
      );
    }

    await prisma.foco.delete({
      where: { id: Number(id) }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error, 'Error al eliminar foco');
  }
}
