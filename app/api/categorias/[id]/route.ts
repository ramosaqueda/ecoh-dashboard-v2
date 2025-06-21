// app/api/categorias/[id]/route.ts - CÓDIGO FINAL COMPLETO

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        sitios: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            url: true,
            icono: true,
            orden: true
          }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const response = {
      ...categoria,
      sitios_count: categoria.sitios.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nombre, descripcion, color, icono, orden, activo } = body;

    const categoriaExistente = await prisma.categoria.findUnique({
      where: { id }
    });

    if (!categoriaExistente) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    if (nombre && nombre !== categoriaExistente.nombre) {
      const nombreDuplicado = await prisma.categoria.findUnique({
        where: { nombre }
      });

      if (nombreDuplicado) {
        return NextResponse.json(
          { error: 'Ya existe una categoría con ese nombre' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, any> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (color !== undefined) updateData.color = color;
    if (icono !== undefined) updateData.icono = icono;
    if (orden !== undefined) updateData.orden = orden;
    if (activo !== undefined) updateData.activo = activo;

    const categoriaActualizada = await prisma.categoria.update({
      where: { id },
      data: updateData,
      include: {
        sitios: {
          where: { activo: true },
          select: { id: true, nombre: true }
        }
      }
    });

    const response = {
      ...categoriaActualizada,
      sitios_count: categoriaActualizada.sitios.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        sitios: {
          where: { activo: true },
          select: { id: true }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const sitiosActivos = categoria.sitios.length;
    if (sitiosActivos > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar la categoría porque tiene sitios asociados',
          sitios_count: sitiosActivos
        },
        { status: 409 }
      );
    }

    await prisma.categoria.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Categoría eliminada exitosamente',
      deletedCategory: categoria.nombre 
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}