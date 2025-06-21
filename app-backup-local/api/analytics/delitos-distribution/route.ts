import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Manejar la opción "todos" para el año
    const yearParam = searchParams.get('year');
    let dateFilter = {};
    
    // Solo aplicar filtro de fecha si year no es "todos" y existe
    if (yearParam && yearParam !== 'todos') {
      const year = parseInt(yearParam);
      
      if (isNaN(year)) {
        return NextResponse.json(
          { error: 'El parámetro year debe ser un número válido' },
          { status: 400 }
        );
      }
      
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      
      dateFilter = {
        fechaDelHecho: {
          gte: startDate,
          lte: endDate
        }
      };
    }
    
    const onlyEcoh = searchParams.get('onlyEcoh') === 'true';

    // Obtener los delitos primero para poder filtrar por ECOH si es necesario
    const delitos = await prisma.delito.findMany({
      where: onlyEcoh ? {
        nombre: {
          contains: 'ECOH',
          mode: 'insensitive'
        }
      } : undefined
    });

    const delitoIds = delitos.map(d => d.id);
    const delitoMap = new Map(delitos.map((d) => [d.id, d.nombre]));

    // Combinar filtros de fecha y delito
    const whereConditions = {
      ...dateFilter,
      delitoId: {
        in: delitoIds
      }
    };

    console.log('Consulta delitos con filtros:', whereConditions);

    const distribution = await prisma.causa.groupBy({
      by: ['delitoId'],
      where: whereConditions,
      _count: true,
      orderBy: {
        _count: {
          delitoId: 'desc'
        }
      }
    });

    const result = distribution.reduce(
      (acc, curr) => {
        if (curr.delitoId) {
          const delitoNombre = delitoMap.get(curr.delitoId) || 'Sin clasificar';
          acc[delitoNombre] = curr._count;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching delitos distribution:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}