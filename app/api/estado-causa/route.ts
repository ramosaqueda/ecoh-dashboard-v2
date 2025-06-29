import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activo = searchParams.get('activo');
    const id = searchParams.get('id');

    // Si se solicita un estado específico
    if (id) {
      const estado = await prisma.estadoCausa.findUnique({
        where: { id: Number(id) },
        include: {
          _count: {
            select: {
              causas: true
            }
          }
        }
      });

      if (!estado) {
        return NextResponse.json(
          { message: 'Estado de causa no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json(estado);
    }

    // Filtros para listado
    const whereClause: any = {};
    
    if (activo !== null) {
      whereClause.activo = activo === 'true';
    }

    const estados = await prisma.estadoCausa.findMany({
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

    return NextResponse.json(estados);
  } catch (error) {
    console.error('Error en GET /api/estado-causa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { codigo, nombre, descripcion, activo = true } = data;

    if (!codigo || !nombre) {
      return NextResponse.json(
        { message: 'Código y nombre son requeridos' },
        { status: 400 }
      );
    }

    const nuevoEstado = await prisma.estadoCausa.create({
      data: {
        codigo: codigo.toUpperCase(),
        nombre,
        descripcion: descripcion || null,
        activo
      }
    });

    return NextResponse.json(nuevoEstado, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/estado-causa:', error);
    
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
    const { codigo, nombre, descripcion, activo } = data;

    const updateData: any = {};
    
    if (codigo) updateData.codigo = codigo.toUpperCase();
    if (nombre) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion || null;
    if (activo !== undefined) updateData.activo = activo;

    const estadoActualizado = await prisma.estadoCausa.update({
      where: { id: Number(id) },
      data: updateData
    });

    return NextResponse.json(estadoActualizado);
  } catch (error) {
    console.error('Error en PUT /api/estado-causa:', error);
    
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
      if ((error as any).code === 'P2025') {
        return NextResponse.json(
          { message: 'Estado no encontrado' },
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
      where: { idEstado: Number(id) }
    });

    if (causasAsociadas > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar. Hay ${causasAsociadas} causa(s) asociada(s)` },
        { status: 409 }
      );
    }

    await prisma.estadoCausa.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: 'Estado eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/estado-causa:', error);
    
    if (error instanceof Error && error.name === 'PrismaClientKnownRequestError' && (error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Estado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}