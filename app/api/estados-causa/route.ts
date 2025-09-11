import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EstadoCausa } from '@/types/causa';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const estados = await prisma.estadoCausa.findMany({
      where: includeInactive ? {} : {
        activo: true
      },
      orderBy: [
        { orden: 'asc' },     // Por orden primero
        { nombre: 'asc' }     // Luego por nombre
      ]
    });

    // Transformar los datos para asegurar el tipado correcto
    const transformedEstados: EstadoCausa[] = estados.map(estado => ({
      id: estado.id,
      nombre: estado.nombre,
      descripcion: estado.descripcion,
      codigo: estado.codigo,
      activo: estado.activo,
      orden: estado.orden,
      color: estado.color,
      createdAt: estado.createdAt.toISOString(),
      updatedAt: estado.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedEstados, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error al obtener estados de causa:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los estados de causa'
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
    const { nombre, descripcion, codigo, activo = true, orden, color } = body;

    // Validaciones básicas
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: 'El nombre es requerido y debe ser una cadena válida' },
        { status: 400 }
      );
    }

    if (!codigo || typeof codigo !== 'string' || codigo.trim().length === 0) {
      return NextResponse.json(
        { error: 'El código es requerido y debe ser una cadena válida' },
        { status: 400 }
      );
    }

    if (nombre.trim().length > 100) {
      return NextResponse.json(
        { error: 'El nombre no puede exceder 100 caracteres' },
        { status: 400 }
      );
    }

    if (codigo.trim().length > 20) {
      return NextResponse.json(
        { error: 'El código no puede exceder 20 caracteres' },
        { status: 400 }
      );
    }

    if (descripcion && descripcion.length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un estado con el mismo nombre o código
    const existingEstado = await prisma.estadoCausa.findFirst({
      where: {
        OR: [
          { nombre: { equals: nombre.trim(), mode: 'insensitive' } },
          { codigo: { equals: codigo.trim(), mode: 'insensitive' } }
        ]
      }
    });

    if (existingEstado) {
      const conflictField = existingEstado.nombre.toLowerCase() === nombre.trim().toLowerCase() ? 'nombre' : 'código';
      return NextResponse.json(
        { error: `Ya existe un estado de causa con ese ${conflictField}` },
        { status: 409 }
      );
    }

    // Crear nuevo estado
    const nuevoEstado = await prisma.estadoCausa.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        codigo: codigo.trim().toUpperCase(),
        activo: Boolean(activo),
        orden: orden ? parseInt(orden) : null,
        color: color || null
      }
    });

    const transformedEstado: EstadoCausa = {
      id: nuevoEstado.id,
      nombre: nuevoEstado.nombre,
      descripcion: nuevoEstado.descripcion,
      codigo: nuevoEstado.codigo,
      activo: nuevoEstado.activo,
      orden: nuevoEstado.orden,
      color: nuevoEstado.color,
      createdAt: nuevoEstado.createdAt.toISOString(),
      updatedAt: nuevoEstado.updatedAt.toISOString()
    };

    return NextResponse.json(transformedEstado, { status: 201 });

  } catch (error) {
    console.error('Error al crear estado de causa:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo crear el estado de causa'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido para actualizar' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nombre, descripcion, codigo, activo, orden, color } = body;

    // Verificar que el estado existe
    const estadoExistente = await prisma.estadoCausa.findUnique({
      where: { id: parseInt(id) }
    });

    if (!estadoExistente) {
      return NextResponse.json(
        { error: 'Estado de causa no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar estado
    const estadoActualizado = await prisma.estadoCausa.update({
      where: { id: parseInt(id) },
      data: {
        ...(nombre !== undefined && { nombre: nombre.trim() }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null }),
        ...(codigo !== undefined && { codigo: codigo.trim().toUpperCase() }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
        ...(orden !== undefined && { orden: orden ? parseInt(orden) : null }),
        ...(color !== undefined && { color: color || null })
      }
    });

    const transformedEstado: EstadoCausa = {
      id: estadoActualizado.id,
      nombre: estadoActualizado.nombre,
      descripcion: estadoActualizado.descripcion,
      codigo: estadoActualizado.codigo,
      activo: estadoActualizado.activo,
      orden: estadoActualizado.orden,
      color: estadoActualizado.color,
      createdAt: estadoActualizado.createdAt.toISOString(),
      updatedAt: estadoActualizado.updatedAt.toISOString()
    };

    return NextResponse.json(transformedEstado, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar estado de causa:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el estado de causa'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}