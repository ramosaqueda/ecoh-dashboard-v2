// app/api/reportes/fiscales/export/route.ts - MIGRADO A NUEVO ESQUEMA
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { ReporteFiltros } from '@/types/reporte';

const prisma = new PrismaClient();

// ✅ CONSTANTES DE ORIGEN - Sincronizadas con endpoint principal
const ORIGEN_IDS = {
  SACFI: 1,
  ECOH_ELQUI: 2,
  ECOH_LIMARI: 3,
  OTRAS_FISCALIAS: 4
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros
    const formato = searchParams.get('formato') as 'xlsx' | 'csv';
    
    // ✅ MIGRADO: Filtros actualizados para nuevo esquema
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
      
      esCrimenOrganizado: searchParams.get('esCrimenOrganizado') ? 
          (searchParams.get('esCrimenOrganizado') === 'true') : undefined,
    };

    if (!formato || !['xlsx', 'csv'].includes(formato)) {
      return NextResponse.json({ error: 'Formato no válido' }, { status: 400 });
    }

    // ✅ MIGRADO: whereConditions actualizadas
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
    
    // ✅ NUEVO: Filtros por origen y estado
    if (filtros.origenCausaId !== undefined) {
      whereConditions.origenCausaId = filtros.origenCausaId;
    }
    
    if (filtros.estadoCausaId !== undefined) {
      whereConditions.estadoCausaId = filtros.estadoCausaId;
    }
    
    if (filtros.esCrimenOrganizado !== undefined) {
      whereConditions.esCrimenOrganizado = filtros.esCrimenOrganizado;
    }

    // ✅ MIGRADO: Consulta con nuevas relaciones
    const [causas, todosFiscales] = await Promise.all([
      prisma.causa.findMany({
        where: whereConditions,
        include: {
          fiscal: true,
          delito: true,
          foco: true,
          tribunal: true,
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
      }),
      prisma.fiscal.findMany({
        orderBy: { nombre: 'asc' }
      })
    ]);

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

    // ✅ MIGRADO: Procesamiento con nuevo esquema
    causas.forEach(causa => {
      const fiscalId = causa.fiscalId;
      const stats = estadisticasPorFiscal.get(fiscalId);
      
      if (stats) {
        stats.causas.push(causa);
        stats.totales.total++;
        
        // ✅ NUEVO: Conteo basado en origenCausaId
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

    // ✅ MIGRADO: Datos para exportación con nuevos campos
    // 1. Hoja de Resumen por Fiscal
    const resumenData = Array.from(estadisticasPorFiscal.entries())
      .map(([fiscalId, stats]) => ({
        'ID Fiscal': fiscalId || 'N/A',
        'Nombre Fiscal': stats.fiscal?.nombre || 'Sin Fiscal Asignado',
        'Total Causas': stats.totales.total,
        'Causas ECOH': stats.totales.ecoh,
        'Causas SACFI': stats.totales.sacfi, // ✅ NUEVO: Campo separado para SACFI
        'Causas Legadas': stats.totales.legadas,
        'Causas con SS': stats.totales.conSS,
        'Homicidios': stats.totales.homicidio,
        'Crimen Organizado': stats.totales.crimenOrg,
        'Porcentaje del Total': causas.length > 0 ? ((stats.totales.total / causas.length) * 100).toFixed(2) + '%' : '0%'
      }))
      .filter(item => item['Total Causas'] > 0)
      .sort((a, b) => b['Total Causas'] - a['Total Causas']);

    // ✅ MIGRADO: Detalle de causas con nuevos campos
    const detalleData = causas.map(causa => ({
      'ID': causa.id,
      'RUC': causa.ruc || 'N/A',
      'Denominación': causa.denominacionCausa,
      'Fiscal': causa.fiscal?.nombre || 'Sin Asignar',
      'Fecha del Hecho': causa.fechaDelHecho ? causa.fechaDelHecho.toISOString().split('T')[0] : 'N/A',
      'Fecha Toma Conocimiento': causa.fechaHoraTomaConocimiento ? causa.fechaHoraTomaConocimiento.toISOString().split('T')[0] : 'N/A',
      'RIT': causa.rit || 'N/A',
      'Delito': causa.delito?.nombre || 'N/A',
      'Foco': causa.foco?.nombre || 'N/A',
      'Tribunal': causa.tribunal?.nombre || 'N/A',
      
      // ✅ MIGRADO: Campos derivados de origenCausa
      'Origen': causa.origenCausa?.nombre || 'Sin Origen',
      'Es ECOH': (causa.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || causa.origenCausaId === ORIGEN_IDS.ECOH_LIMARI) ? 'Sí' : 'No',
      'Es SACFI': causa.origenCausaId === ORIGEN_IDS.SACFI ? 'Sí' : 'No',
      'Es Legada': causa.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS ? 'Sí' : 'No',
      
      // ✅ NUEVO: Estado de causa
      'Estado Causa': causa.estadoCausa?.nombre || 'Sin Estado',
      'Código Estado': causa.estadoCausa?.codigo || 'N/A',
      
      'Constituye SS': causa.constituyeSs ? 'Sí' : (causa.constituyeSs === false ? 'No' : 'N/A'),
      'Homicidio Consumado': causa.homicidioConsumado ? 'Sí' : (causa.homicidioConsumado === false ? 'No' : 'N/A'),
      'Crimen Organizado': causa.esCrimenOrganizado === true ? 'Sí' : 
                          (causa.esCrimenOrganizado === false ? 'No' : 'Desconocido'),
      'Cant. Imputados': causa._count.imputados,
      'Cant. Víctimas': causa._count.victimas,
      'Observación': causa.observacion || ''
    }));

    if (formato === 'csv') {
      // Exportar como CSV (solo el detalle)
      const csvContent = [
        // Headers
        Object.keys(detalleData[0] || {}).join(','),
        // Data rows
        ...detalleData.map(row => 
          Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          ).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="reporte-fiscales-migrado-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });

    } else if (formato === 'xlsx') {
      // ✅ MIGRADO: Excel con información actualizada
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen por Fiscal
      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen por Fiscal');

      // Hoja 2: Detalle de Causas
      const wsDetalle = XLSX.utils.json_to_sheet(detalleData);
      XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle de Causas');

      // ✅ MIGRADO: Información del reporte actualizada
      const infoReporte = [
        { Campo: 'Fecha de Generación', Valor: new Date().toLocaleString() },
        { Campo: 'Total de Causas', Valor: causas.length },
        { Campo: 'Fiscales con Causas', Valor: resumenData.length },
        { Campo: '', Valor: '' },
        { Campo: '=== FILTROS APLICADOS ===', Valor: '' },
        { Campo: 'Fecha Inicio', Valor: filtros.fechaInicio || 'No aplicado' },
        { Campo: 'Fecha Fin', Valor: filtros.fechaFin || 'No aplicado' },
        { Campo: 'Fiscal Específico', Valor: filtros.fiscalId ? `ID: ${filtros.fiscalId}` : 'Todos' },
        { Campo: 'Origen Causa', Valor: filtros.origenCausaId ? getOrigenName(filtros.origenCausaId) : 'Todos' },
        { Campo: 'Estado Causa', Valor: filtros.estadoCausaId ? `ID: ${filtros.estadoCausaId}` : 'Todos' },
        { Campo: 'Crimen Organizado', Valor: filtros.esCrimenOrganizado !== undefined ? 
          (filtros.esCrimenOrganizado ? 'Sí' : 'No') : 'Todos' },
        { Campo: '', Valor: '' },
        { Campo: '=== DISTRIBUCIÓN POR ORIGEN ===', Valor: '' },
        { Campo: 'ECOH Total', Valor: causas.filter(c => c.origenCausaId === ORIGEN_IDS.ECOH_ELQUI || c.origenCausaId === ORIGEN_IDS.ECOH_LIMARI).length },
        { Campo: 'SACFI', Valor: causas.filter(c => c.origenCausaId === ORIGEN_IDS.SACFI).length },
        { Campo: 'Otras Fiscalías', Valor: causas.filter(c => c.origenCausaId === ORIGEN_IDS.OTRAS_FISCALIAS).length },
        { Campo: 'Sin Origen', Valor: causas.filter(c => c.origenCausaId === null).length }
      ];
      const wsInfo = XLSX.utils.json_to_sheet(infoReporte);
      XLSX.utils.book_append_sheet(workbook, wsInfo, 'Info del Reporte');

      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-fiscales-migrado-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },  
      });
    }

    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });

  } catch (error) {
    console.error('Error en exportación migrada:', error);
    return NextResponse.json(
      { error: 'Error al exportar el reporte', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

// ✅ HELPER FUNCTIONS - Sincronizadas con endpoint principal
function getOrigenName(origenId: number | null): string {
  switch (origenId) {
    case ORIGEN_IDS.SACFI: return 'SACFI';
    case ORIGEN_IDS.ECOH_ELQUI: return 'ECOH Elqui';
    case ORIGEN_IDS.ECOH_LIMARI: return 'ECOH Limarí';
    case ORIGEN_IDS.OTRAS_FISCALIAS: return 'Otras Fiscalías';
    default: return 'Sin Origen';
  }
}