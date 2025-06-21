// app/api/Nacionalidad/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Nacionalidad } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      // Obtener un Nacionalidad específico
      const Nacionalidad = await prisma.nacionalidad.findUnique({
        where: { id: Number(id) }
      });
      if (Nacionalidad) {
        return NextResponse.json(Nacionalidad);
      } else {
        return NextResponse.json(
          { message: 'Nacionalidad no encontrado' },
          { status: 404 }
        );
      }
    } else {
      // Obtener todos los Nacionalidades
      const Nacionalidades = await prisma.nacionalidad.findMany();
      return NextResponse.json(Nacionalidades);
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al obtener Nacionalidad(s)', error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();
    const Nacionalidad = await prisma.nacionalidad.create({
      data: { nombre }
    });
    return NextResponse.json(Nacionalidad, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al crear Nacionalidad', error },
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
    const Nacionalidad = await prisma.nacionalidad.update({
      where: { id: Number(id) },
      data: { nombre }
    });
    return NextResponse.json(Nacionalidad);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al actualizar Nacionalidad', error },
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
    await prisma.nacionalidad.delete({
      where: { id: Number(id) }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al eliminar Nacionalidad', error },
      { status: 500 }
    );
  }
}
