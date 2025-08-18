import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const includeInactive = searchParams.get('include_inactive') === 'true';

    const whereCondition = includeInactive ? {} : { activo: true };

    const origenes = await prisma.origenCausa.findMany({
      where: whereCondition,
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        codigo: true,
        activo: true,
        orden: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            causas: true
          }
        }
      }
    });

    return NextResponse.json(origenes);
  } catch (error) {
    console.error('Error en GET /api/origenes-causa:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validación básica
    if (!data.nombre || !data.codigo) {
      return NextResponse.json(
        { message: 'Nombre y código son requeridos' },
        { status: 400 }
      );
    }

    const nuevoOrigen = await prisma.origenCausa.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        codigo: data.codigo.toUpperCase(),
        activo: data.activo ?? true,
        orden: data.orden || null,
        color: data.color || null
      }
    });

    return NextResponse.json(nuevoOrigen, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/origenes-causa:', error);
    
    // Manejo de errores específicos de Prisma
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Ya existe un origen con ese nombre o código' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    const origenActualizado = await prisma.origenCausa.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        codigo: data.codigo?.toUpperCase(),
        activo: data.activo,
        orden: data.orden || null,
        color: data.color || null
      }
    });

    return NextResponse.json(origenActualizado);
  } catch (error) {
    console.error('Error en PUT /api/origenes-causa:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { message: 'Origen de causa no encontrado' },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { message: 'Ya existe un origen con ese nombre o código' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    // Verificar si tiene causas asociadas
    const causasAsociadas = await prisma.causa.count({
      where: { origenCausaId: Number(id) }
    });

    if (causasAsociadas > 0) {
      return NextResponse.json(
        { 
          message: `No se puede eliminar. Hay ${causasAsociadas} causa(s) asociada(s) a este origen.`,
          causasAsociadas 
        },
        { status: 409 }
      );
    }

    await prisma.origenCausa.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json(
      { message: 'Origen de causa eliminado correctamente' }
    );
  } catch (error) {
    console.error('Error en DELETE /api/origenes-causa:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { message: 'Origen de causa no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
