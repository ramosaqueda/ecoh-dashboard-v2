import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get('year') || new Date().getFullYear().toString()
    );
    const type = searchParams.get('type') || 'all';
    const delitoId = searchParams.get('delito_id');

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Construir las condiciones where
    const whereCondition: any = {
      fechaDelHecho: {
        gte: startDate,
        lte: endDate
      }
    };

    // Añadir condición para causas ECOH si se especifica
    if (type === 'ecoh') {
      whereCondition.causaEcoh = true;
    }

    // Añadir filtro de tipo de delito si se proporciona
    if (delitoId) {
      whereCondition.delitoId = parseInt(delitoId);
    }

    const cases = await prisma.causa.groupBy({
      by: ['fechaDelHecho'],
      where: whereCondition,
      _count: true,
      orderBy: {
        fechaDelHecho: 'asc'
      }
    });

    const monthlyData = monthNames.map((month, index) => ({
      month,
      count: 0
    }));

    cases.forEach((caseData) => {
      if (caseData.fechaDelHecho) {
        const monthIndex = caseData.fechaDelHecho.getMonth();
        monthlyData[monthIndex].count += caseData._count;
      }
    });

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('Error fetching case timeline:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}