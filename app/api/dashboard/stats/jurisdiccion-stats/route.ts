import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/jurisdiccion-stats
 * Obtiene métricas separadas por ECOH Elqui (id=2) y ECOH Limarí (id=3)
 * 
 * Métricas incluidas:
 * - Causas vigentes
 * - Concurrencias a SS (constituyeSs = true)
 * - Homicidios consumados
 * - Homicidios consumados + crimen organizado
 * - Aristas (causas relacionadas)
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

    console.log('📊 [API] Calculando estadísticas por jurisdicción...');

    // Obtener parámetros de año (opcional)
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    
    // Filtro de año si se proporciona
    const yearFilter = year ? {
      fechaDelHecho: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      }
    } : {};

    // ======================================
    // ECOH ELQUI (origenCausaId = 2)
    // ======================================
    
    const [
      elquiCausasVigentes,
      elquiConcurrenciasSS,
      elquiHomicidios,
      elquiHomicidiosCO,
      elquiAristas
    ] = await Promise.all([
      // 1. Causas vigentes
      prisma.causa.count({
        where: {
          origenCausaId: 2,
          ...yearFilter
        }
      }),
      
      // 2. Concurrencias a SS
      prisma.causa.count({
        where: {
          origenCausaId: 2,
          constituyeSs: true,
          ...yearFilter
        }
      }),
      
      // 3. Homicidios consumados
      prisma.causa.count({
        where: {
          origenCausaId: 2,
          homicidioConsumado: true,
          ...yearFilter
        }
      }),
      
      // 4. Homicidios consumados + crimen organizado
      prisma.causa.count({
        where: {
          origenCausaId: 2,
          homicidioConsumado: true,
          esCrimenOrganizado: true,
          ...yearFilter
        }
      }),
      
      // 5. Aristas (causas relacionadas)
      prisma.causasRelacionadas.count({
        where: {
          causaMadre: {
            origenCausaId: 2,
            ...yearFilter
          }
        }
      })
    ]);

    // ======================================
    // ECOH LIMARÍ (origenCausaId = 3)
    // ======================================
    
    const [
      limariCausasVigentes,
      limariConcurrenciasSS,
      limariHomicidios,
      limariHomicidiosCO,
      limariAristas
    ] = await Promise.all([
      // 1. Causas vigentes
      prisma.causa.count({
        where: {
          origenCausaId: 3,
          ...yearFilter
        }
      }),
      
      // 2. Concurrencias a SS
      prisma.causa.count({
        where: {
          origenCausaId: 3,
          constituyeSs: true,
          ...yearFilter
        }
      }),
      
      // 3. Homicidios consumados
      prisma.causa.count({
        where: {
          origenCausaId: 3,
          homicidioConsumado: true,
          ...yearFilter
        }
      }),
      
      // 4. Homicidios consumados + crimen organizado
      prisma.causa.count({
        where: {
          origenCausaId: 3,
          homicidioConsumado: true,
          esCrimenOrganizado: true,
          ...yearFilter
        }
      }),
      
      // 5. Aristas (causas relacionadas)
      prisma.causasRelacionadas.count({
        where: {
          causaMadre: {
            origenCausaId: 3,
            ...yearFilter
          }
        }
      })
    ]);

    const stats = {
      ecohElqui: {
        id: 2,
        nombre: 'ECOH Elqui',
        color: '#10B981', // verde
        causasVigentes: elquiCausasVigentes,
        concurrenciasSS: elquiConcurrenciasSS,
        homicidiosConsumados: elquiHomicidios,
        homicidiosCrimenOrganizado: elquiHomicidiosCO,
        aristas: elquiAristas
      },
      ecohLimari: {
        id: 3,
        nombre: 'ECOH Limarí-Choapa',
        color: '#F59E0B', // naranja
        causasVigentes: limariCausasVigentes,
        concurrenciasSS: limariConcurrenciasSS,
        homicidiosConsumados: limariHomicidios,
        homicidiosCrimenOrganizado: limariHomicidiosCO,
        aristas: limariAristas
      },
      totales: {
        causasVigentes: elquiCausasVigentes + limariCausasVigentes,
        concurrenciasSS: elquiConcurrenciasSS + limariConcurrenciasSS,
        homicidiosConsumados: elquiHomicidios + limariHomicidios,
        homicidiosCrimenOrganizado: elquiHomicidiosCO + limariHomicidiosCO,
        aristas: elquiAristas + limariAristas
      }
    };

    console.log('✅ [API] Estadísticas calculadas:', stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ [API] Error al calcular estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
