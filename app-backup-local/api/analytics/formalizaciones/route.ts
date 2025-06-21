// app/api/analytics/formalizaciones/route.ts
import { NextResponse } from 'next/server';
import {prisma}  from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const delitoId = searchParams.get('delitoId');
    const ecoh = searchParams.get('ecoh');

    // Base query conditions
    const whereClause: any = {
      formalizado: true,
      causa: {
        fechaDelHecho: {
          not: null
        }
      }
    };

    // Add filters if provided
    if (delitoId) {
      whereClause.causa.delitoId = parseInt(delitoId);
    }

    if (ecoh === 'true') {
      whereClause.causa.causaEcoh = true;
    }

    // Get all formalized cases grouped by year
    const formalizaciones = await prisma.causasImputados.groupBy({
      by: ['fechaFormalizacion'],
      where: whereClause,
      _count: true,
    });

    // Get cases with cautelar measures
    const conMedidas = await prisma.causasImputados.groupBy({
      by: ['fechaFormalizacion'],
      where: {
        ...whereClause,
        cautelarId: {
          not: null
        }
      },
      _count: true,
    });

    // Process the data by year
    const dataByYear = new Map();

    // Process formalizaciones
    formalizaciones.forEach((item) => {
      if (item.fechaFormalizacion) {
        const year = new Date(item.fechaFormalizacion).getFullYear();
        if (!dataByYear.has(year)) {
          dataByYear.set(year, {
            year: year.toString(),
            formalizados: 0,
            conMedida: 0
          });
        }
        const yearData = dataByYear.get(year);
        yearData.formalizados += item._count;
      }
    });

    // Process medidas cautelares
    conMedidas.forEach((item) => {
      if (item.fechaFormalizacion) {
        const year = new Date(item.fechaFormalizacion).getFullYear();
        if (dataByYear.has(year)) {
          const yearData = dataByYear.get(year);
          yearData.conMedida += item._count;
        }
      }
    });

    // Convert to array and sort by year
    const chartData = Array.from(dataByYear.values())
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}