// app/api/analista/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Obtener un analista específico
      const analista = await prisma.analista.findUnique({
        where: { id: Number(id) }
      });
      if (analista) {
        return NextResponse.json(analista);
      } else {
        return NextResponse.json(
          { message: 'Analista no encontrado' },
          { status: 404 }
        );
      }
    } else {
      // Obtener todos los analistas
      const analistas = await prisma.analista.findMany();
      return NextResponse.json(analistas);
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al obtener analista(s)', error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();
    const analista = await prisma.analista.create({
      data: { nombre }
    });
    return NextResponse.json(analista, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al crear analista', error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { message: 'Se requiere ID para actualizar' },
      { status: 400 }
    );
  }

  try {
    const { nombre } = await request.json();
    const analista = await prisma.analista.update({
      where: { id: Number(id) },
      data: { nombre }
    });
    return NextResponse.json(analista);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al actualizar analista', error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { message: 'Se requiere ID para eliminar' },
      { status: 400 }
    );
  }

  try {
    await prisma.analista.delete({
      where: { id: Number(id) }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al eliminar analista', error },
      { status: 500 }
    );
  }
}
