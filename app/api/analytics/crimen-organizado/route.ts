import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ Interfaces para mejor tipado
interface CausaConDelito {
  id: number;
  esCrimenOrganizado: number | null; // 0 = false, 1 = true, null = no definido
  delito: {
    id: number;
    nombre: string;
  } | null;
}

interface ResumenDelito {
  delito: string;
  cantidad: number;
}

// 🔥 HELPER FUNCTION - Reutilizable y más limpia
function mapBooleanToNumber(value: boolean | null): number | null {
  if (value === null) return null;
  return value ? 1 : 0;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const tipoDelitoId = searchParams.get('tipoDelito');

    // Construir filtros
    const whereClause = {
      ...(year && year !== 'todos' && {
        fechaDelHecho: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      }),
      ...(tipoDelitoId && tipoDelitoId !== 'todos' && {
        delitoId: parseInt(tipoDelitoId),
      }),
    };

    // Contar total de causas
    const totalCausas = await prisma.causa.count({
      where: whereClause
    });

    // Obtener causas con información de crimen organizado
    const causasRaw = await prisma.causa.findMany({
      where: whereClause,
      select: {
        id: true,
        esCrimenOrganizado: true,
        delito: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    // 🔥 MAPEO MEJORADO - Más limpio y reutilizable
    const causas: CausaConDelito[] = causasRaw.map((causa) => ({
      id: causa.id,
      esCrimenOrganizado: mapBooleanToNumber(causa.esCrimenOrganizado),
      delito: causa.delito
    }));

    // Filtrar causas de crimen organizado (valor 1)
    const causasCrimenOrganizado = causas.filter(causa => causa.esCrimenOrganizado === 1);
    
    // Calcular porcentaje
    const porcentaje = totalCausas > 0 ? (causasCrimenOrganizado.length / totalCausas) * 100 : 0;

    // Agrupar por tipo de delito
    const resumenPorDelito: Record<string, number> = {};
    
    causasCrimenOrganizado.forEach(causa => {
      const delitoNombre = causa.delito?.nombre || 'Sin delito';
      resumenPorDelito[delitoNombre] = (resumenPorDelito[delitoNombre] || 0) + 1;
    });

    // Convertir a array para respuesta
    const resumenPorDelitoArray: ResumenDelito[] = Object.entries(resumenPorDelito)
      .map(([delito, cantidad]) => ({ delito, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad); // 🔥 MEJORA: Ordenar por cantidad desc

    // Respuesta final
    const response = {
      totalCausas,
      causasCrimenOrganizado: causasCrimenOrganizado.length,
      porcentaje: Math.round(porcentaje * 100) / 100,
      resumenPorDelito: resumenPorDelitoArray
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error en API de crimen organizado:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined // 🔥 MEJORA: Solo mostrar detalles en desarrollo
    }, { status: 500 });
  }
}