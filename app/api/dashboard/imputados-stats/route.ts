import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/imputados-stats
 * Obtiene métricas de imputados separadas por ECOH Elqui (id=2) y ECOH Limarí (id=3)
 * 
 * Métricas incluidas:
 * - Total de imputados únicos
 * - Imputados formalizados en el período
 * - Imputados formalizados en causas vigentes
 * - Imputados con cautelar aplicada
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 Verificar autenticación
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('👤 [API] Calculando estadísticas de imputados...');

    // Obtener parámetros de año (opcional)
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    // Filtro de año para fechas
    const yearFilter = year ? {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`)
    } : undefined;

    // Filtro de año para causas
    const causaYearFilter = year ? {
      fechaDelHecho: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      }
    } : {};

    // ======================================
    // ECOH ELQUI (origenCausaId = 2)
    // ======================================
    
    const [
      elquiTotalImputados,
      elquiFormalizados,
      elquiFormalizadosVigentes,
      elquiConCautelar
    ] = await Promise.all([
      // 1. Total de imputados únicos en causas de esta jurisdicción
      prisma.imputado.count({
        where: {
          causas: {
            some: {
              causa: {
                origenCausaId: 2,
                ...causaYearFilter
              }
            }
          }
        }
      }),
      
      // 2. Imputados formalizados en el período
      prisma.causasImputados.count({
        where: {
          causa: {
            origenCausaId: 2,
            ...causaYearFilter
          },
          formalizado: true,
          ...(yearFilter ? {
            fechaFormalizacion: yearFilter
          } : {})
        }
      }),
      
      // 3. Imputados formalizados en causas vigentes
      // (causas que no tienen estado cerrado)
      prisma.causasImputados.count({
        where: {
          causa: {
            origenCausaId: 2,
            // Aquí podrías agregar filtro de estado si defines qué es "vigente"
            // Por ahora, consideramos todas las causas
          },
          formalizado: true
        }
      }),
      
      // 4. Imputados con cautelar aplicada
      prisma.causasImputados.count({
        where: {
          causa: {
            origenCausaId: 2,
            ...causaYearFilter
          },
          cautelarId: {
            not: null
          }
        }
      })
    ]);

    // ======================================
    // ECOH LIMARÍ (origenCausaId = 3)
    // ======================================
    
    const [
      limariTotalImputados,
      limariFormalizados,
      limariFormalizadosVigentes,
      limariConCautelar
    ] = await Promise.all([
      // 1. Total de imputados únicos
      prisma.imputado.count({
        where: {
          causas: {
            some: {
              causa: {
                origenCausaId: 3,
                ...causaYearFilter
              }
            }
          }
        }
      }),
      
      // 2. Imputados formalizados en el período
      prisma.causasImputados.count({
        where: {
          causa: {
            origenCausaId: 3,
            ...causaYearFilter
          },
          formalizado: true,
          ...(yearFilter ? {
            fechaFormalizacion: yearFilter
          } : {})
        }
      }),
      
      // 3. Imputados formalizados en causas vigentes
      prisma.causasImputados.count({
        where: {
          causa: {
            origenCausaId: 3
          },
          formalizado: true
        }
      }),
      
      // 4. Imputados con cautelar aplicada
      prisma.causasImputados.count({
        where: {
          causa: {
            origenCausaId: 3,
            ...causaYearFilter
          },
          cautelarId: {
            not: null
          }
        }
      })
    ]);

    const stats = {
      ecohElqui: {
        id: 2,
        nombre: 'ECOH Elqui',
        color: '#10B981', // verde
        totalImputados: elquiTotalImputados,
        formalizadosPeriodo: elquiFormalizados,
        formalizadosVigentes: elquiFormalizadosVigentes,
        conCautelar: elquiConCautelar
      },
      ecohLimari: {
        id: 3,
        nombre: 'ECOH Limarí-Choapa',
        color: '#F59E0B', // naranja
        totalImputados: limariTotalImputados,
        formalizadosPeriodo: limariFormalizados,
        formalizadosVigentes: limariFormalizadosVigentes,
        conCautelar: limariConCautelar
      },
      totales: {
        totalImputados: elquiTotalImputados + limariTotalImputados,
        formalizadosPeriodo: elquiFormalizados + limariFormalizados,
        formalizadosVigentes: elquiFormalizadosVigentes + limariFormalizadosVigentes,
        conCautelar: elquiConCautelar + limariConCautelar
      }
    };

    console.log('✅ [API] Estadísticas de imputados calculadas:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ [API] Error al calcular estadísticas de imputados:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de imputados' },
      { status: 500 }
    );
  }
}