import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OrigenCausa } from '@/types/causa';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const origenes = await prisma.origenCausa.findMany({
      where: includeInactive ? {} : {
        activo: true
      },
      orderBy: [
        { activo: 'desc' }, // Activos primero
        { nombre: 'asc' }   // Luego por nombre
      ]
    });

    // Transformar los datos para incluir el campo 'codigo' que espera el componente
    const transformedOrigenes: OrigenCausa[] = origenes.map(origen => ({
      id: origen.id,
      nombre: origen.nombre,
      descripcion: origen.descripcion,
      activo: origen.activo,
      color: origen.color,
      codigo: origen.nombre, // Usar nombre como código por ahora
      createdAt: origen.createdAt.toISOString(),
      updatedAt: origen.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedOrigenes, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error al obtener orígenes de causa:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los orígenes de causa'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, color, activo = true } = body;

    // Validaciones básicas
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido y debe ser una cadena válida' },
        { status: 400 }
      );
    }

    if (nombre.trim().length > 100) {
      return NextResponse.json(
        { error: 'El nombre no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    if (descripcion && descripcion.length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un origen con el mismo nombre
    const existingOrigen = await prisma.origenCausa.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingOrigen) {
      return NextResponse.json(
        { error: 'Ya existe un origen de causa con ese nombre' },
        { status: 409 }
      );
    }

    // Crear nuevo origen
    const nuevoOrigen = await prisma.origenCausa.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        color: color || null,
        activo: Boolean(activo)
      }
    });

    const transformedOrigen: OrigenCausa = {
      id: nuevoOrigen.id,
      nombre: nuevoOrigen.nombre,
      descripcion: nuevoOrigen.descripcion,
      activo: nuevoOrigen.activo,
      color: nuevoOrigen.color,
      codigo: nuevoOrigen.nombre,
      createdAt: nuevoOrigen.createdAt.toISOString(),
      updatedAt: nuevoOrigen.updatedAt.toISOString()
    };

    return NextResponse.json(transformedOrigen, { status: 201 });

  } catch (error) {
    console.error('Error al crear origen de causa:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo crear el origen de causa'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}