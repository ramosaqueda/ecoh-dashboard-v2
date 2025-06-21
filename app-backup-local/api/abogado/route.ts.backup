// app/api/abogado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Obtener todos los abogados o uno específico por ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Obtener un abogado específico
      const abogado = await prisma.abogado.findUnique({
        where: { id: Number(id) }
      });
      if (abogado) {
        return NextResponse.json(abogado);
      } else {
        return NextResponse.json({ error: 'Abogado no encontrado' }, { status: 404 });
      }
    } else {
      // Obtener todos los abogados
      const abogados = await prisma.abogado.findMany({
        orderBy: {
          nombre: 'asc'
        }
      });
      return NextResponse.json(abogados);
    }
  } catch (error) {
    console.error('Error al obtener abogados:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de abogados' },
      { status: 500 }
    );
  }
}

// Crear un nuevo abogado
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const nuevoAbogado = await prisma.abogado.create({
      data: {
        nombre: data.nombre,
        // No incluimos email, telefono y activo ya que no existen en el modelo
      }
    });
    
    return NextResponse.json(nuevoAbogado, { status: 201 });
  } catch (error) {
    console.error('Error al crear abogado:', error);
    return NextResponse.json(
      { error: 'Error al crear abogado' },
      { status: 500 }
    );
  }
}

// Actualizar un abogado existente
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID para actualizar' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    const abogadoActualizado = await prisma.abogado.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre,
        // No incluimos email, telefono y activo ya que no existen en el modelo
      }
    });
    
    return NextResponse.json(abogadoActualizado);
  } catch (error) {
    console.error('Error al actualizar abogado:', error);
    return NextResponse.json(
      { error: 'Error al actualizar abogado' },
      { status: 500 }
    );
  }
}

// Eliminar un abogado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere ID para eliminar' },
        { status: 400 }
      );
    }
    
    await prisma.abogado.delete({
      where: { id: Number(id) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar abogado:', error);
    return NextResponse.json(
      { error: 'Error al eliminar abogado' },
      { status: 500 }
    );
  }
}