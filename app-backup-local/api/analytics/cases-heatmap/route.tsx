import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    
    // Si no se proporciona año o es "todos", obtener datos de todos los años
    if (!yearParam || yearParam === 'todos') {
      // Para todos los años, tomar los últimos 5 años por defecto para el heatmap
      // (para evitar una visualización demasiado densa)
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear - 5, 0, 1);
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      
      // Obtener casos agrupados por fecha
      const cases = await prisma.causa.groupBy({
        by: ['fechaDelHecho'],
        where: {
          fechaDelHecho: {
            gte: startDate,
            lte: endDate,
            not: null
          }
        },
        _count: true
      });
      
      // Convertir directamente a formato de heatmap
      const heatmapData = cases.map(caseData => ({
        date: caseData.fechaDelHecho?.toISOString().split('T')[0] || '',
        count: caseData._count
      })).filter(item => item.date !== '');
      
      return NextResponse.json(heatmapData);
    } else {
      // Comportamiento original para un año específico
      const year = parseInt(yearParam);
      
      if (isNaN(year)) {
        return NextResponse.json(
          { error: 'El parámetro year debe ser un número válido' },
          { status: 400 }
        );
      }

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      // Obtener casos agrupados por fecha
      const cases = await prisma.causa.groupBy({
        by: ['fechaDelHecho'],
        where: {
          fechaDelHecho: {
            gte: startDate,
            lte: endDate,
            not: null
          }
        },
        _count: true
      });

      // Crear array con todos los días del año
      const allDays = [] as any[];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        allDays.push({
          date: currentDate.toISOString().split('T')[0],
          count: 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Llenar con datos reales
      cases.forEach((caseData) => {
        if (caseData.fechaDelHecho) {
          const dateStr = caseData.fechaDelHecho.toISOString().split('T')[0];
          const dayIndex = allDays.findIndex((d) => d.date === dateStr);
          if (dayIndex !== -1) {
            allDays[dayIndex].count = caseData._count;
          }
        }
      });

      return NextResponse.json(allDays);
    }
  } catch (error) {
    console.error('Error fetching cases heatmap:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}