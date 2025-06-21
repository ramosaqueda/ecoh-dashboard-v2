// app/api/mi-hallazgos/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const hallazgo = await prisma.mIHallazgos.findUnique({
        where: { id: Number(id) }
      });
      if (hallazgo) {
        return NextResponse.json(hallazgo);
      } else {
        return NextResponse.json(
          { message: 'Hallazgo no encontrado' },
          { status: 404 }
        );
      }
    } else {
      const hallazgos = await prisma.mIHallazgos.findMany();
      return NextResponse.json(hallazgos);
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al obtener hallazgos', error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();
    const hallazgo = await prisma.mIHallazgos.create({
      data: { nombre }
    });
    return NextResponse.json(hallazgo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al crear hallazgo', error },
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
    const hallazgo = await prisma.mIHallazgos.update({
      where: { id: Number(id) },
      data: { nombre }
    });
    return NextResponse.json(hallazgo);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al actualizar hallazgo', error },
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
    await prisma.mIHallazgos.delete({
      where: { id: Number(id) }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al eliminar hallazgo', error },
      { status: 500 }
    );
  }
}