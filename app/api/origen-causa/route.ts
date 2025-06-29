import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activo = searchParams.get('activo');
    const id = searchParams.get('id');

    // Si se solicita un origen específico
    if (id) {
      const origen = await prisma.origenCausa.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              causas: true
            }
          }
        }
      });

      if (!origen) {
        return NextResponse.json(
          { message: 'Origen de causa no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(origen);
    }

    // Filtros para listado
    const whereClause: any = {};
    
    if (activo !== null) {
      whereClause.activo = activo === 'true';
    }

    const origenes = await prisma.origenCausa.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            causas: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(origenes);
  } catch (error) {
    console.error('Error en GET /api/origen-causa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { codigo, nombre, activo = true } = data;

    if (!codigo || !nombre) {
      return NextResponse.json(
        { message: 'Código y nombre son requeridos' },
        { status: 400 }
      );
    }

    const nuevoOrigen = await prisma.origenCausa.create({
      data: {
        codigo: codigo.toUpperCase(),
        nombre,
        activo
      }
    });

    return NextResponse.json(nuevoOrigen, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/origen-causa:', error);
    
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && (error as any).code === 'P2002') {
      return NextResponse.json(
        { message: 'El código ya existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const { codigo, nombre, activo } = data;

    const updateData: any = {};
    
    if (codigo) updateData.codigo = codigo.toUpperCase();
    if (nombre) updateData.nombre = nombre;
    if (activo !== undefined) updateData.activo = activo;

    const origenActualizado = await prisma.origenCausa.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json(origenActualizado);
  } catch (error) {
    console.error('Error en PUT /api/origen-causa:', error);
    
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      if ((error as any).code === 'P2025') {
        return NextResponse.json(
          { message: 'Origen no encontrado' },
          { status: 404 }
        );
      }
      
      if ((error as any).code === 'P2002') {
        return NextResponse.json(
          { message: 'El código ya existe' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    // Verificar si hay causas asociadas
    const causasAsociadas = await prisma.causa.count({
      where: { idOrigen: Number(id) }
    });

    if (causasAsociadas > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar. Hay ${causasAsociadas} causa(s) asociada(s)` },
        { status: 409 }
      );
    }

    await prisma.origenCausa.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'Origen eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/origen-causa:', error);
    
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && (error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Origen no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}