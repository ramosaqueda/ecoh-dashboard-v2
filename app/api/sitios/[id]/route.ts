// app/api/sitios/[id]/route.ts - CORREGIDO PARA NEXT.JS 15

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

    const sitio = await prisma.sitio.findUnique({
      where: { id },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
            icono: true
          }
        }
      }
    });

    if (!sitio) {
      return NextResponse.json(
        { error: 'Sitio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(sitio);
  } catch (error) {
    console.error('Error al obtener sitio:', error);
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
    const { nombre, descripcion, url, icono, categoriaId, orden, activo } = body;

    // Verificar que el sitio existe
    const sitioExistente = await prisma.sitio.findUnique({
      where: { id }
    });

    if (!sitioExistente) {
      return NextResponse.json(
        { error: 'Sitio no encontrado' },
        { status: 404 }
      );
    }

    // Validaciones básicas
    if (nombre !== undefined && !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (url !== undefined && !url.trim()) {
      return NextResponse.json(
        { error: 'La URL es requerida' },
        { status: 400 }
      );
    }

    // Verificar que la categoría existe si se proporciona
    if (categoriaId !== undefined && categoriaId !== null) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: parseInt(categoriaId.toString()) }
      });

      if (!categoria) {
        return NextResponse.json(
          { error: 'La categoría especificada no existe' },
          { status: 400 }
        );
      }
    }

    // Crear objeto de actualización solo con campos definidos
    const updateData: Record<string, any> = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (url !== undefined) updateData.url = url;
    if (icono !== undefined) updateData.icono = icono;
    if (categoriaId !== undefined) {
      updateData.categoriaId = categoriaId ? parseInt(categoriaId.toString()) : null;
    }
    if (orden !== undefined) updateData.orden = orden;
    if (activo !== undefined) updateData.activo = activo;

    const sitioActualizado = await prisma.sitio.update({
      where: { id },
      data: updateData,
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            color: true,
            icono: true
          }
        }
      }
    });

    return NextResponse.json(sitioActualizado);
  } catch (error) {
    console.error('Error al actualizar sitio:', error);
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

    // Verificar que el sitio existe
    const sitio = await prisma.sitio.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true
      }
    });

    if (!sitio) {
      return NextResponse.json(
        { error: 'Sitio no encontrado' },
        { status: 404 }
      );
    }

    await prisma.sitio.delete({
      where: { id }
    });

    return NextResponse.json({ 
      message: 'Sitio eliminado exitosamente',
      deletedSite: sitio.nombre 
    });
  } catch (error) {
    console.error('Error al eliminar sitio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}