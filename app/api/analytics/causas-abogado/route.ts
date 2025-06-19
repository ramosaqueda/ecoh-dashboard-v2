import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const lawyers = await prisma.causa.groupBy({
      by: ['abogadoId'],
      _count: true,
      orderBy: {
        _count: {
          abogadoId: 'desc'
        }
      }
    });

    const abogados = await prisma.abogado.findMany();
    const result = lawyers.map((lawyer) => {
      const abogado = abogados.find((a) => a.id === lawyer.abogadoId);
      return {
        name: abogado?.nombre || 'Sin asignar',
        count: lawyer._count
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
