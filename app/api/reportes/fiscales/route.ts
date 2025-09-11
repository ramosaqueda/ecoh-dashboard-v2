// app/api/reportes/fiscales/route.ts - MIGRADO A NUEVO ESQUEMA
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  ReporteFiscalesResponse, 
  FiscalReporte, 
  CausaReporteDetalle, 
  ReporteFiltros 
} from '@/types/reporte';

const prisma = new PrismaClient();

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
    
    // ✅ MIGRADO: Parámetros actualizados para nuevo esquema
    const filtros: ReporteFiltros = {
      fechaInicio: searchParams.get('fechaInicio') || undefined,
      fechaFin: searchParams.get('fechaFin') || undefined,
      fiscalId: searchParams.get('fiscalId') ? parseInt(searchParams.get('fiscalId')!) : undefined,
      
      // ✅ NUEVOS CAMPOS - Reemplazan campos obsoletos
      origenCausaId: searchParams.get('origenCausaId') ? parseInt(searchParams.get('origenCausaId')!) : undefined,
      estadoCausaId: searchParams.get('estadoCausaId') ? parseInt(searchParams.get('estadoCausaId')!) : undefined,
      
      // ✅ COMPATIBILIDAD TEMPORAL - Convertir campos obsoletos a nuevos IDs
      ...(searchParams.get('causaEcoh') === 'true' && { origenCausaId: ORIGEN_IDS.ECOH_ELQUI }),
      ...(searchParams.get('causaSacfi') === 'true' && { origenCausaId: ORIGEN_IDS.SACFI }),
      ...(searchParams.get('causaLegada') === 'true' && { origenCausaId: ORIGEN_IDS.OTRAS_FISCALIAS }),
      
      // Campo existente mantenido
      esCrimenOrganizado: searchParams.get('esCrimenOrganizado') ? 
        searchParams.get('esCrimenOrganizado') === 'true' : undefined,
    };

    // ✅ MIGRADO: whereConditions actualizado
    const whereConditions: any = {};
    
    if (filtros.fechaInicio || filtros.fechaFin) {
      whereConditions.fechaDelHecho = {};
      if (filtros.fechaInicio) {
        whereConditions.fechaDelHecho.gte = new Date(filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        whereConditions.fechaDelHecho.lte = new Date(filtros.fechaFin);
      }
    }
    
    if (filtros.fiscalId) {
      whereConditions.fiscalId = filtros.fiscalId;
    }
    
    // ✅ NUEVO: Filtro por origen en lugar de campos lógicos
    if (filtros.origenCausaId !== undefined) {
      whereConditions.origenCausaId = filtros.origenCausaId;
    }
    
    // ✅ NUEVO: Filtro por estado de causa
    if (filtros.estadoCausaId !== undefined) {
      whereConditions.estadoCausaId = filtros.estadoCausaId;
    }
    
    if (filtros.esCrimenOrganizado !== undefined) {
      whereConditions.esCrimenOrganizado = filtros.esCrimenOrganizado;
    }

    // ✅ MIGRADO: Consulta con nuevas relaciones incluidas
    const causas = await prisma.causa.findMany({
      where: whereConditions,
      include: {
        fiscal: true,
        delito: true,
        foco: true,
        // ✅ NUEVAS RELACIONES
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

    // 2. Obtener todos los fiscales para incluir los que no tienen causas
    const todosFiscales = await prisma.fiscal.findMany({
      orderBy: { nombre: 'asc' }
    });

    // ✅ MIGRADO: Estadísticas por fiscal actualizadas
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

    // ✅ MIGRADO: Procesamiento de causas con nuevo esquema
    causas.forEach(causa => {
      const fiscalId = causa.fiscalId;
      const stats = estadisticasPorFiscal.get(fiscalId);
      
      if (stats) {
        stats.causas.push(causa);
        stats.totales.total++;
        
        // ✅ NUEVO: Conteo basado en origenCausaId en lugar de campos lógicos
        if (causa.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausaId === ORIGEN_IDS.ECOH_LIMARI) {
          stats.totales.ecoh++;
        }
        if (causa.origenCausaId === ORIGEN_IDS.SACFI) {
          stats.totales.sacfi++;
        }
        if (causa.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS) {
          stats.totales.legadas++;
        }
        
        if (causa.constituyeSs) stats.totales.conSS++;
        if (causa.homicidioConsumado) stats.totales.homicidio++;
        if (causa.esCrimenOrganizado === true) stats.totales.crimenOrg++;
      }
    });

    const totalCausas = causas.length;

    // ✅ MIGRADO: Resumen por fiscal con nuevos campos
    const resumenPorFiscal: FiscalReporte[] = Array.from(estadisticasPorFiscal.entries())
      .map(([fiscalId, stats]) => ({
        fiscalId,
        fiscalNombre: stats.fiscal?.nombre || 'Sin Fiscal Asignado',
        totalCausas: stats.totales.total,
        causasEcoh: stats.totales.ecoh,
        causasSacfi: stats.totales.sacfi, // ✅ AÑADIDO: Campo para SACFI separado
        causasLegadas: stats.totales.legadas,
        causasConSS: stats.totales.conSS,
        causasHomicidio: stats.totales.homicidio,
        causasCrimenOrg: stats.totales.crimenOrg,
        porcentajeDelTotal: totalCausas > 0 ? (stats.totales.total / totalCausas) * 100 : 0
      }))
      .sort((a, b) => b.totalCausas - a.totalCausas);

    // ✅ MIGRADO: Detalle de causas con nuevos campos
    const detallesCausas: CausaReporteDetalle[] = causas.map(causa => ({
      id: causa.id,
      ruc: causa.ruc || '',
      denominacionCausa: causa.denominacionCausa,
      fechaDelHecho: causa.fechaDelHecho?.toISOString().split('T')[0] || null,
      fechaHoraTomaConocimiento: causa.fechaHoraTomaConocimiento?.toISOString() || null,
      
      // ✅ MIGRADO: Campos derivados de origenCausa
      causaEcoh: causa.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausaId === ORIGEN_IDS.ECOH_LIMARI,
      causaSacfi: causa.origenCausaId === ORIGEN_IDS.SACFI,
      causaLegada: causa.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS,
      
      // ✅ NUEVOS CAMPOS: Información completa de origen y estado
      origenCausa: causa.origenCausa ? {
        id: causa.origenCausa.id,
        nombre: causa.origenCausa.nombre,
        color: causa.origenCausa.color
      } : null,
      estadoCausa: causa.estadoCausa ? {
        id: causa.estadoCausa.id,
        nombre: causa.estadoCausa.nombre,
        codigo: causa.estadoCausa.codigo,
        color: causa.estadoCausa.color
      } : null,
      
      constituyeSs: causa.constituyeSs,
      homicidioConsumado: causa.homicidioConsumado,
      esCrimenOrganizado: causa.esCrimenOrganizado,
      rit: causa.rit,
      fiscal: causa.fiscal ? {
        id: causa.fiscal.id,
        nombre: causa.fiscal.nombre
      } : null,
      delito: causa.delito ? {
        id: causa.delito.id,
        nombre: causa.delito.nombre
      } : null,
      foco: causa.foco ? {
        id: causa.foco.id,
        nombre: causa.foco.nombre
      } : null,
      _count: {
        imputados: causa._count.imputados,
        victimas: causa._count.victimas
      }
    }));

    // 6. Calcular estadísticas generales
    const fiscalesConCausas = resumenPorFiscal.filter(f => f.totalCausas > 0 && f.fiscalId !== null).length;
    const fiscalesSinCausas = todosFiscales.length - fiscalesConCausas;
    const causasSinFiscal = resumenPorFiscal.find(f => f.fiscalId === null)?.totalCausas || 0;
    const promedioCausasPorFiscal = fiscalesConCausas > 0 ? 
      (totalCausas - causasSinFiscal) / fiscalesConCausas : 0;

    // ✅ MIGRADO: Respuesta con metadatos adicionales
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
      },
      // ✅ NUEVO: Información de distribución por origen
      distribucionPorOrigen: {
        ecoh: causas.filter(c => c.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || c.origenCausaId === ORIGEN_IDS.ECOH_LIMARI).length,
        sacfi: causas.filter(c => c.origenCausaId === ORIGEN_IDS.SACFI).length,
        legadas: causas.filter(c => c.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS).length,
        sinOrigen: causas.filter(c => c.origenCausaId === null).length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en reporte de fiscales migrado:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte de fiscales', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// ✅ HELPER FUNCTIONS - Funciones auxiliares para migración
export function mapLegacyFiltersToOrigin(params: URLSearchParams) {
  // Función para convertir filtros obsoletos a nuevos IDs de origen
  if (params.get('causaEcoh') === 'true') return ORIGEN_IDS.ECOH_ELQUI;
  if (params.get('causaSacfi') === 'true') return ORIGEN_IDS.SACFI;
  if (params.get('causaLegada') === 'true') return ORIGEN_IDS.OTRAS_FISCALIAS;
  return undefined;
}

export function getOrigenName(origenId: number | null): string {
  switch (origenId) {
    case ORIGEN_IDS.SACFI: return 'SACFI';
    case ORIGEN_IDS.ECOH_ELQUI: return 'ECOH Elqui';
    case ORIGEN_IDS.ECOH_LIMARI: return 'ECOH Limarí';
    case ORIGEN_IDS.OTRAS_FISCALIAS: return 'Otras Fiscalías';
    default: return 'Sin Origen';
  }
}