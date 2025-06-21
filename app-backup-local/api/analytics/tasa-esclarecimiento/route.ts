import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Obtener parámetros de la consulta
    const yearParam = req.nextUrl.searchParams.get('year');
    const tipoDelito = req.nextUrl.searchParams.get('tipoDelito');
    const homicidioConsumado = req.nextUrl.searchParams.get('homicidioConsumado') === 'true';

    // Definir las condiciones base de la consulta
    const whereConditions: any = {};

    // Filtrar por año si no es "todos"
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

      whereConditions.fechaDelHecho = {
        gte: startDate,
        lte: endDate
      };
    }

    // Aplicar otros filtros
    whereConditions.causaEcoh = true;
    
    if (tipoDelito && tipoDelito !== 'todos') {
      whereConditions.delitoId = parseInt(tipoDelito);
    }
    
    if (homicidioConsumado) {
      whereConditions.homicidioConsumado = true;
    }

    // Contar total de causas con estos filtros
    const totalCausas = await prisma.causa.count({
      where: whereConditions
    });

    // Obtener causas con imputados
    const causasImputados = await prisma.causa.findMany({
      where: whereConditions,
      include: {
        imputados: {
          include: {
            cautelar: true,
            imputado: true
          }
        }
      }
    });

    // Analizar los datos para el esclarecimiento
    const causasFormalizadasSet = new Set();
    const causasConCautelarSet = new Set();
    const causasAmbasSituacionesSet = new Set();
    const causasEsclarecidasSet = new Set();

    causasImputados.forEach((causa) => {
      const tieneFormalizados = causa.imputados.some(imp => imp.formalizado);
      const tieneCautelar = causa.imputados.some(imp => imp.cautelarId !== null);

      if (tieneFormalizados) {
        causasFormalizadasSet.add(causa.id);
      }

      if (tieneCautelar) {
        causasConCautelarSet.add(causa.id);
      }

      if (tieneFormalizados && tieneCautelar) {
        causasAmbasSituacionesSet.add(causa.id);
      }

      if (tieneFormalizados || tieneCautelar) {
        causasEsclarecidasSet.add(causa.id);
      }
    });

    const porcentaje = totalCausas > 0 
      ? (causasEsclarecidasSet.size / totalCausas) * 100 
      : 0;

    return NextResponse.json({
      totalCausas,
      causasEsclarecidas: causasEsclarecidasSet.size,
      porcentaje,
      detalles: {
        causasFormalizadas: causasFormalizadasSet.size,
        causasConCautelar: causasConCautelarSet.size,
        causasAmbasSituaciones: causasAmbasSituacionesSet.size
      }
    });
  } catch (error) {
    console.error('Error fetching tasa esclarecimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}