// app/api/Cautelar/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Cautelar } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Obtener un Cautelar específico
      const Cautelar = await prisma.cautelar.findUnique({
        where: { id: Number(id) }
      });
      if (Cautelar) {
        return NextResponse.json(Cautelar);
      } else {
        return NextResponse.json(
          { message: 'Cautelar no encontrado' },
          { status: 404 }
        );
      }
    } else {
      // Obtener todos los Cautelars
      const Cautelars = await prisma.cautelar.findMany();
      return NextResponse.json(Cautelars);
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al obtener Cautelar(s)', error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();
    const Cautelar = await prisma.cautelar.create({
      data: { nombre }
    });
    return NextResponse.json(Cautelar, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al crear Cautelar', error },
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
    const Cautelar = await prisma.cautelar.update({
      where: { id: Number(id) },
      data: { nombre }
    });
    return NextResponse.json(Cautelar);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al actualizar Cautelar', error },
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
    await prisma.cautelar.delete({
      where: { id: Number(id) }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al eliminar Cautelar', error },
      { status: 500 }
    );
  }
}
