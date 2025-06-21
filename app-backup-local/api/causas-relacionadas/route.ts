// app/api/causas-relacionadas/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { causaMadreId, causaAristaId, tipoRelacion, observacion } = data;

    const causaRelacionada = await prisma.causasRelacionadas.create({
      data: {
        causaMadreId: parseInt(causaMadreId),
        causaAristaId: parseInt(causaAristaId),
        tipoRelacion,
        observacion
      },
      include: {
        causaMadre: true,
        causaArista: true
      }
    });

    return NextResponse.json(causaRelacionada);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al crear la relación entre causas' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const causaId = searchParams.get('causaId');
    
    if (!causaId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la causa' },
        { status: 400 }
      );
    }

    const relaciones = await prisma.causasRelacionadas.findMany({
      where: {
        OR: [
          { causaMadreId: parseInt(causaId) },
          { causaAristaId: parseInt(causaId) }
        ]
      },
      include: {
        causaMadre: true,
        causaArista: true
      }
    });

    return NextResponse.json(relaciones);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener las causas relacionadas' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la relación' },
        { status: 400 }
      );
    }

    await prisma.causasRelacionadas.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar la relación' },
      { status: 500 }
    );
  }
}