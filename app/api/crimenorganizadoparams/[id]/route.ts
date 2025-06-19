// app/api/crimenorganizadoparams/[id]/route.ts
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
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Usar el campo único correcto - podría ser 'value' en lugar de 'id'
    const parametro = await prisma.crimenOrganizadoParams.findUnique({
      where: { value: id }  // o where: { id } si tu modelo sí tiene campo id
    });

    if (!parametro) {
      return NextResponse.json(
        { error: 'Parámetro no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(parametro);
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al obtener parámetro de crimen organizado', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Corregir: hacer await de params
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const data = await request.json();
    
    // ✅ Usar el nombre correcto del modelo y campo único
    const parametro = await prisma.crimenOrganizadoParams.update({
      where: { value: id },  // o where: { id } si tu modelo sí tiene campo id
      data: {
        // Ajustar los campos según tu modelo
        label: data.label || data.nombre,
        // value: data.value,  // No actualizar el campo único
        // Otros campos según tu schema
      }
    });

    return NextResponse.json(parametro);
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al actualizar parámetro de crimen organizado', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Corregir: hacer await de params
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // ✅ Usar el nombre correcto del modelo y campo único
    await prisma.crimenOrganizadoParams.delete({
      where: { value: id }  // o where: { id } si tu modelo sí tiene campo id
    });

    return NextResponse.json({ message: 'Parámetro eliminado correctamente' });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al eliminar parámetro de crimen organizado', details: errorMessage },
      { status: 500 }
    );
  }
}