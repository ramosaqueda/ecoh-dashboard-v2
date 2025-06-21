import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ✅ Mejor usar singleton

// ✅ Definir interfaces para mejor tipado
interface CausaConDelito {
  id: number;
  esCrimenOrganizado: number | null; // ✅ Cambio: puede ser null
  delito: {
    id: number;
    nombre: string;
  } | null;
}

interface ResumenDelito {
  delito: string;
  cantidad: number;
}

export async function GET(request: NextRequest) {
  try {
    // Obtenemos los parámetros de la URL
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const tipoDelitoId = searchParams.get('tipoDelito');

    // Construimos la consulta base para todas las causas
    const whereClause = {
      // Filtro por año si está especificado
      ...(year && year !== 'todos' && {
        fechaDelHecho: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${parseInt(year) + 1}-01-01`),
        },
      }),
      // Filtro por tipo de delito si está especificado
      ...(tipoDelitoId && tipoDelitoId !== 'todos' && {
        delitoId: parseInt(tipoDelitoId),
      }),
    };

    // Contar el total de causas que cumplen con los filtros
    const totalCausas = await prisma.causa.count({
      where: whereClause
    });

    // Obtener todas las causas con crimen organizado
    const causas: CausaConDelito[] = await prisma.causa.findMany({
      where: {
        ...whereClause,
      },
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

    // Filtrar las causas marcadas como crimen organizado
    const causasCrimenOrganizado = causas.filter(causa => causa.esCrimenOrganizado === 1);
    
    // Calcular porcentaje
    const porcentaje = totalCausas > 0 ? (causasCrimenOrganizado.length / totalCausas) * 100 : 0;

    // ✅ Tipar explícitamente el objeto para evitar el error de indexación
    const resumenPorDelito: Record<string, number> = {};
    
    causasCrimenOrganizado.forEach(causa => {
      const delitoNombre = causa.delito?.nombre || 'Sin delito';
      if (!resumenPorDelito[delitoNombre]) {
        resumenPorDelito[delitoNombre] = 0;
      }
      resumenPorDelito[delitoNombre]++;
    });

    // Convertir el objeto a array para la respuesta final
    const resumenPorDelitoArray: ResumenDelito[] = Object.entries(resumenPorDelito).map(([delito, cantidad]) => ({
      delito,
      cantidad
    }));

    // Construir la respuesta
    const response = {
      totalCausas,
      causasCrimenOrganizado: causasCrimenOrganizado.length,
      porcentaje: Math.round(porcentaje * 100) / 100, // ✅ Redondear a 2 decimales
      resumenPorDelito: resumenPorDelitoArray
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en API de crimen organizado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}