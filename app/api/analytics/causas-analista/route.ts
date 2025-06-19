import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const analysts = await prisma.causa.groupBy({
      by: ['analistaId'],
      _count: true,
      orderBy: {
        _count: {
          analistaId: 'desc'
        }
      }
    });

    const analistas = await prisma.analista.findMany();
    const result = analysts.map((analyst) => {
      const analista = analistas.find((a) => a.id === analyst.analistaId);
      return {
        name: analista?.nombre || 'Sin asignar',
        count: analyst._count
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
