// app/api/reportes/fiscales/route.ts - OPTIMIZADO PARA NUEVO ESQUEMA
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Usar la instancia singleton
import { 
  ReporteFiscalesResponse, 
  FiscalReporte, 
  CausaReporteDetalle, 
  ReporteFiltros 
} from '@/types/reporte';

// ✅ CONSTANTES DE ORIGEN - Basadas en tabla origenes_causa
const ORIGEN_IDS = {
  SACFI: 1,
  ECOH_ELQUI: 2,
  ECOH_LIMARI: 3,
  OTRAS_FISCALIAS: 4
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ✅ Parámetros de filtro optimizados
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const fiscalId = searchParams.get('fiscalId');
    const origenCausaId = searchParams.get('origenCausaId');
    const estadoCausaId = searchParams.get('estadoCausaId');
    const esCrimenOrganizado = searchParams.get('esCrimenOrganizado');

    const filtros: ReporteFiltros = {
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      fiscalId: fiscalId ? parseInt(fiscalId) : undefined,
      origenCausaId: origenCausaId ? parseInt(origenCausaId) : undefined,
      estadoCausaId: estadoCausaId ? parseInt(estadoCausaId) : undefined,
      esCrimenOrganizado: esCrimenOrganizado ? esCrimenOrganizado === 'true' : undefined,
      
      // ✅ Compatibilidad con filtros legacy
      ...(searchParams.get('causaEcoh') === 'true' && { origenCausaId: ORIGEN_IDS.ECOH_ELQUI }),
      ...(searchParams.get('causaSacfi') === 'true' && { origenCausaId: ORIGEN_IDS.SACFI }),
      ...(searchParams.get('causaLegada') === 'true' && { origenCausaId: ORIGEN_IDS.OTRAS_FISCALIAS }),
    };

    // ✅ Construcción optimizada de condiciones WHERE
    const whereConditions: any = {};
    
    // Filtro por rango de fechas
    if (fechaInicio || fechaFin) {
      whereConditions.fechaDelHecho = {};
      if (fechaInicio) {
        whereConditions.fechaDelHecho.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        whereConditions.fechaDelHecho.lte = new Date(fechaFin);
      }
    }
    
    // Filtros directos
    if (filtros.fiscalId) whereConditions.fiscalId = filtros.fiscalId;
    if (filtros.origenCausaId !== undefined) whereConditions.origenCausaId = filtros.origenCausaId;
    if (filtros.estadoCausaId !== undefined) whereConditions.estadoCausaId = filtros.estadoCausaId;
    if (filtros.esCrimenOrganizado !== undefined) whereConditions.esCrimenOrganizado = filtros.esCrimenOrganizado;

    // ✅ Consulta optimizada con selects específicos
    const causas = await prisma.causa.findMany({
      where: whereConditions,
      select: {
        id: true,
        denominacionCausa: true,
        ruc: true,
        fechaDelHecho: true,
        fechaHoraTomaConocimiento: true,
        rit: true,
        constituyeSs: true,
        homicidioConsumado: true,
        esCrimenOrganizado: true,
        fiscalId: true,
        fiscal: {
          select: {
            id: true,
            nombre: true
          }
        },
        delito: {
          select: {
            id: true,
            nombre: true
          }
        },
        foco: {
          select: {
            id: true,
            nombre: true
          }
        },
        origenCausa: {
          select: {
            id: true,
            nombre: true,
            color: true
          }
        },
        estadoCausa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            color: true
          }
        },
        _count: {
          select: {
            imputados: true,
            victimas: true,
          }
        }
      },
      orderBy: [
        { fiscal: { nombre: 'asc' } },
        { denominacionCausa: 'asc' }
      ]
    });

    // ✅ Obtener fiscales con select específico
    const todosFiscales = await prisma.fiscal.findMany({
      select: {
        id: true,
        nombre: true
      },
      orderBy: { nombre: 'asc' }
    });

    // ✅ Inicializar estadísticas de forma más eficiente
    const estadisticasPorFiscal = new Map<number | null, {
      fiscal: { id: number; nombre: string } | null;
      causas: typeof causas;
      totales: {
        total: number;
        ecoh: number;
        sacfi: number;
        legadas: number;
        conSS: number;
        homicidio: number;
        crimenOrg: number;
      };
    }>();

    // Inicializar con todos los fiscales
    todosFiscales.forEach(fiscal => {
      estadisticasPorFiscal.set(fiscal.id, {
        fiscal,
        causas: [],
        totales: { total: 0, ecoh: 0, sacfi: 0, legadas: 0, conSS: 0, homicidio: 0, crimenOrg: 0 }
      });
    });

    // Agregar entrada para causas sin fiscal
    estadisticasPorFiscal.set(null, {
      fiscal: null,
      causas: [],
      totales: { total: 0, ecoh: 0, sacfi: 0, legadas: 0, conSS: 0, homicidio: 0, crimenOrg: 0 }
    });

    // ✅ Procesamiento optimizado de causas
    causas.forEach(causa => {
      const fiscalId = causa.fiscalId;
      const stats = estadisticasPorFiscal.get(fiscalId);
      
      if (stats) {
        stats.causas.push(causa);
        stats.totales.total++;
        
        // Conteo por origen
        if (causa.origenCausa?.id === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausa?.id === ORIGEN_IDS.ECOH_LIMARI) {
          stats.totales.ecoh++;
        }
        if (causa.origenCausa?.id === ORIGEN_IDS.SACFI) {
          stats.totales.sacfi++;
        }
        if (causa.origenCausa?.id === ORIGEN_IDS.OTRAS_FISCALIAS) {
          stats.totales.legadas++;
        }
        
        if (causa.constituyeSs) stats.totales.conSS++;
        if (causa.homicidioConsumado) stats.totales.homicidio++;
        if (causa.esCrimenOrganizado) stats.totales.crimenOrg++;
      }
    });

    const totalCausas = causas.length;

    // ✅ Resumen por fiscal optimizado
    const resumenPorFiscal: FiscalReporte[] = Array.from(estadisticasPorFiscal.entries())
      .map(([fiscalId, stats]) => ({
        fiscalId,
        fiscalNombre: stats.fiscal?.nombre || 'Sin Fiscal Asignado',
        totalCausas: stats.totales.total,
        causasEcoh: stats.totales.ecoh,
        causasSacfi: stats.totales.sacfi,
        causasLegadas: stats.totales.legadas,
        causasConSS: stats.totales.conSS,
        causasHomicidio: stats.totales.homicidio,
        causasCrimenOrg: stats.totales.crimenOrg,
        porcentajeDelTotal: totalCausas > 0 ? (stats.totales.total / totalCausas) * 100 : 0
      }))
      .sort((a, b) => b.totalCausas - a.totalCausas);

    // ✅ Detalle de causas optimizado
    const detallesCausas: CausaReporteDetalle[] = causas.map(causa => ({
      id: causa.id,
      ruc: causa.ruc || '',
      denominacionCausa: causa.denominacionCausa,
      fechaDelHecho: causa.fechaDelHecho?.toISOString().split('T')[0] || null,
      fechaHoraTomaConocimiento: causa.fechaHoraTomaConocimiento?.toISOString() || null,
      
      // Campos derivados de origen
      causaEcoh: causa.origenCausa?.id === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausa?.id === ORIGEN_IDS.ECOH_LIMARI,
      causaSacfi: causa.origenCausa?.id === ORIGEN_IDS.SACFI,
      causaLegada: causa.origenCausa?.id === ORIGEN_IDS.OTRAS_FISCALIAS,
      
      origenCausa: causa.origenCausa,
      estadoCausa: causa.estadoCausa,
      
      constituyeSs: causa.constituyeSs,
      homicidioConsumado: causa.homicidioConsumado,
      esCrimenOrganizado: causa.esCrimenOrganizado,
      rit: causa.rit,
      fiscal: causa.fiscal,
      delito: causa.delito,
      foco: causa.foco,
      _count: causa._count
    }));

    // ✅ Estadísticas generales optimizadas
    const fiscalesConCausas = resumenPorFiscal.filter(f => f.totalCausas > 0 && f.fiscalId !== null).length;
    const fiscalesSinCausas = todosFiscales.length - fiscalesConCausas;
    const causasSinFiscal = resumenPorFiscal.find(f => f.fiscalId === null)?.totalCausas || 0;
    const promedioCausasPorFiscal = fiscalesConCausas > 0 ? 
      (totalCausas - causasSinFiscal) / fiscalesConCausas : 0;

    // ✅ Respuesta final optimizada
    const response: ReporteFiscalesResponse = {
      resumenPorFiscal,
      detallesCausas,
      totalCausas,
      fechaGeneracion: new Date().toISOString(),
      filtrosAplicados: filtros,
      estadisticasGenerales: {
        fiscalesConCausas,
        fiscalesSinCausas,
        causasSinFiscal,
        promedioCausasPorFiscal: Math.round(promedioCausasPorFiscal * 100) / 100
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en reporte de fiscales:', error);
    return NextResponse.json(
      { 
        error: 'Error al generar el reporte de fiscales', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}