// src/app/api/incidencia-geografica/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const delitoId = searchParams.get('delitoId');
    const focoId = searchParams.get('focoId');
    
    // Construir condiciones de filtrado
    const whereConditions: any = {};
    
    if (fechaInicio && fechaFin) {
      whereConditions.fechaDelHecho = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }
    
    if (delitoId && delitoId !== 'all') {
      whereConditions.delitoId = parseInt(delitoId);
    }
    
    if (focoId && focoId !== 'all') {
      whereConditions.focoId = parseInt(focoId);
    }

    // 1. Obtener resumen por comuna
    const incidenciaPorComuna = await prisma.causa.groupBy({
      by: ['comunaId'],
      _count: {
        id: true
      },
      where: whereConditions,
    });

    // 2. Obtener información completa de las comunas
    const comunasIds = incidenciaPorComuna.map(item => item.comunaId).filter(id => id !== null) as number[];
    
    const comunas = await prisma.comuna.findMany({
      where: {
        id: {
          in: comunasIds
        }
      }
    });
    
    // 3. Obtener distribución por delito para cada comuna
    const delitosPorComuna = await prisma.causa.groupBy({
      by: ['comunaId', 'delitoId'],
      _count: {
        id: true
      },
      where: {
        ...whereConditions,
        comunaId: {
          in: comunasIds
        }
      },
    });
    
    // 4. ✅ Obtener información completa de los delitos - CORREGIDO
    const delitosIdsSet = new Set(
      delitosPorComuna
        .map(item => item.delitoId)
        .filter((id): id is number => id !== null)
    );
    const delitosIds = Array.from(delitosIdsSet);
    
    const delitos = await prisma.delito.findMany({
      where: {
        id: {
          in: delitosIds
        }
      }
    });
    
    // 5. Obtener información para análisis temporal
    const incidenciaTemporal = await prisma.causa.groupBy({
      by: ['comunaId'],
      _count: {
        id: true
      },
      where: {
        ...whereConditions,
        comunaId: {
          in: comunasIds
        }
      },
    });

    // 6. Obtener todos los delitos para filtros
    const todosDelitos = await prisma.delito.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
    
    // 7. Obtener todos los focos para filtros
    const todosFocos = await prisma.foco.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    // 8. Obtener distribución por mes para análisis temporal
    let distribucionMensual: unknown = [];
    
    // Construir la consulta adecuadamente sin interpolación de strings
    const queryFiltros = [];
    const queryParams = [];
    
    if (fechaInicio && fechaFin) {
      queryFiltros.push(`"fechaDelHecho" >= $${queryParams.length + 1} AND "fechaDelHecho" <= $${queryParams.length + 2}`);
      queryParams.push(new Date(fechaInicio), new Date(fechaFin));
    }
    
    if (whereConditions.delitoId) {
      queryFiltros.push(`"delitoId" = $${queryParams.length + 1}`);
      queryParams.push(whereConditions.delitoId);
    }
    
    if (whereConditions.focoId) {
      queryFiltros.push(`"focoId" = $${queryParams.length + 1}`);
      queryParams.push(whereConditions.focoId);
    }
    
    const whereClause = queryFiltros.length > 0 
      ? `AND ${queryFiltros.join(' AND ')}` 
      : '';
    
    const query = `
      SELECT 
        EXTRACT(YEAR FROM "fechaDelHecho")::integer AS "año",
        EXTRACT(MONTH FROM "fechaDelHecho")::integer AS "mes",
        "comunaId"::integer,
        COUNT(*)::integer AS "cantidad"
      FROM "Causa"
      WHERE "fechaDelHecho" IS NOT NULL
        AND "comunaId" IS NOT NULL
        ${whereClause}
      GROUP BY "año", "mes", "comunaId"
      ORDER BY "año", "mes", "comunaId"
    `;
    
    try {
      distribucionMensual = await prisma.$queryRawUnsafe(query, ...queryParams);
    } catch (error) {
      console.error('Error en la consulta SQL:', error);
      distribucionMensual = [];
    }

    // Preparar resultados
    const resultados = comunas.map(comuna => {
      const incidencia = incidenciaPorComuna.find(item => item.comunaId === comuna.id);
      const delitosDistribucion = delitosPorComuna
        .filter(item => item.comunaId === comuna.id)
        .map(item => {
          const delitoInfo = delitos.find(d => d.id === item.delitoId);
          return {
            delitoId: item.delitoId,
            delitoNombre: delitoInfo ? delitoInfo.nombre : 'No especificado',
            cantidad: item._count.id
          };
        });
      
      // Encontrar tendencia mensual para esta comuna
      const tendenciaMensual = Array.isArray(distribucionMensual) ? 
        distribucionMensual.filter((item: any) => item.comunaId === comuna.id) : [];
      
      return {
        id: comuna.id,
        nombre: comuna.nombre,
        cantidadCausas: incidencia ? incidencia._count.id : 0,
        distribucionDelitos: delitosDistribucion,
        tendenciaMensual: tendenciaMensual
      };
    });

    // Ordenar por cantidad de causas (mayor a menor)
    resultados.sort((a, b) => b.cantidadCausas - a.cantidadCausas);

    return NextResponse.json({
      data: resultados,
      filtros: {
        delitos: todosDelitos,
        focos: todosFocos
      },
      total: resultados.length
    });
  } catch (error) {
    console.error('Error al obtener datos de incidencia geográfica:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}