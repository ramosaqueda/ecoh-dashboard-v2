// =======================================================
// ARCHIVO 1: app/api/categorias/route.ts
// =======================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ajusta la ruta según tu configuración

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get('activo');

    const where: any = {};
    
    if (activo !== null) {
      where.activo = activo === 'true';
    }

    const categorias = await prisma.categorias.findMany({
      where,
      include: {
        _count: {
          select: { 
            sitios: {
              where: { activo: true } // Solo contar sitios activos
            }
          }
        }
      },
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return NextResponse.json({
      data: categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, color, icono, orden } = body;

    // Validaciones básicas
    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una categoría con ese nombre
    const categoriaExistente = await prisma.categorias.findUnique({
      where: { nombre }
    });

    if (categoriaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 409 }
      );
    }

    const nuevaCategoria = await prisma.categorias.create({
      data: {
        nombre,
        descripcion,
        color,
        icono,
        orden: orden || null
      },
      include: {
        _count: {
          select: { sitios: true }
        }
      }
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

