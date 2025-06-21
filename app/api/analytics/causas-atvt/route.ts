import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Consulta para obtener causas agrupadas por ATVT
    const causasPorAtvt = await prisma.causa.groupBy({
      by: ['atvtId'],
      _count: {
        id: true
      },
      where: {
        atvtId: {
          not: null // Solo causas que tienen ATVT asignado
        }
      }
    });

    // Obtener los nombres de los ATVTs
    const atvtIds = causasPorAtvt.map(item => item.atvtId).filter(id => id !== null);
    
    const atvts = await prisma.atvt.findMany({
      where: {
        id: {
          in: atvtIds as number[]
        }
      },
      select: {
        id: true,
        nombre: true
      }
    });

    // Mapear los datos al formato esperado
    const resultado = causasPorAtvt.map(item => {
      const atvt = atvts.find(a => a.id === item.atvtId);
      return {
        name: atvt?.nombre || 'ATVT Desconocido',
        count: item._count.id
      };
    });

    // Ordenar por cantidad de causas (descendente)
    const resultadoOrdenado = resultado.sort((a, b) => b.count - a.count);

    return NextResponse.json(resultadoOrdenado);

  } catch (error) {
    console.error('Error al obtener causas por ATVT:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}