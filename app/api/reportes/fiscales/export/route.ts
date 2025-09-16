// app/api/reportes/fiscales/export/route.ts - OPTIMIZADO PARA NUEVO ESQUEMA
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Usar la instancia singleton
import * as XLSX from 'xlsx';
import { ReporteFiltros } from '@/types/reporte';

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
    
    // Extraer parámetros de forma optimizada
    const formato = searchParams.get('formato') as 'xlsx' | 'csv';
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const fiscalId = searchParams.get('fiscalId');
    const origenCausaId = searchParams.get('origenCausaId');
    const estadoCausaId = searchParams.get('estadoCausaId');
    const esCrimenOrganizado = searchParams.get('esCrimenOrganizado');
    const causaEcoh = searchParams.get('causaEcoh');
    const causaSacfi = searchParams.get('causaSacfi');
    const causaLegada = searchParams.get('causaLegada');

    if (!formato || !['xlsx', 'csv'].includes(formato)) {
      return NextResponse.json({ error: 'Formato no válido' }, { status: 400 });
    }

    // ✅ Filtros optimizados
    const filtros: ReporteFiltros = {
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      fiscalId: fiscalId ? parseInt(fiscalId) : undefined,
      origenCausaId: origenCausaId ? parseInt(origenCausaId) : undefined,
      estadoCausaId: estadoCausaId ? parseInt(estadoCausaId) : undefined,
      esCrimenOrganizado: esCrimenOrganizado ? esCrimenOrganizado === 'true' : undefined,
      
      // ✅ Compatibilidad con filtros legacy
      ...(causaEcoh === 'true' && { origenCausaId: ORIGEN_IDS.ECOH_ELQUI }),
      ...(causaSacfi === 'true' && { origenCausaId: ORIGEN_IDS.SACFI }),
      ...(causaLegada === 'true' && { origenCausaId: ORIGEN_IDS.OTRAS_FISCALIAS }),
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
    const [causas, todosFiscales] = await Promise.all([
      prisma.causa.findMany({
        where: whereConditions,
        select: {
          id: true,
          denominacionCausa: true,
          ruc: true,
          fechaDelHecho: true,
          fechaHoraTomaConocimiento: true,
          rit: true,
          observacion: true,
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
          tribunal: {
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
      }),
      prisma.fiscal.findMany({
        select: {
          id: true,
          nombre: true
        },
        orderBy: { nombre: 'asc' }
      })
    ]);

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

    // ✅ Datos para exportación optimizados
    // 1. Hoja de Resumen por Fiscal
    const resumenData = Array.from(estadisticasPorFiscal.entries())
      .filter(([_, stats]) => stats.totales.total > 0)
      .map(([fiscalId, stats]) => ({
        'ID Fiscal': fiscalId || 'N/A',
        'Nombre Fiscal': stats.fiscal?.nombre || 'Sin Fiscal Asignado',
        'Total Causas': stats.totales.total,
        'Causas ECOH': stats.totales.ecoh,
        'Causas SACFI': stats.totales.sacfi,
        'Causas Legadas': stats.totales.legadas,
        'Causas con SS': stats.totales.conSS,
        'Homicidios': stats.totales.homicidio,
        'Crimen Organizado': stats.totales.crimenOrg,
        'Porcentaje del Total': causas.length > 0 ? 
          ((stats.totales.total / causas.length) * 100).toFixed(2) + '%' : '0%'
      }))
      .sort((a, b) => b['Total Causas'] - a['Total Causas']);

    // ✅ Detalle de causas optimizado
    const detalleData = causas.map(causa => ({
      'ID': causa.id,
      'RUC': causa.ruc || 'N/A',
      'Denominación': causa.denominacionCausa,
      'Fiscal': causa.fiscal?.nombre || 'Sin Asignar',
      'Fecha del Hecho': causa.fechaDelHecho ? 
        causa.fechaDelHecho.toISOString().split('T')[0] : 'N/A',
      'Fecha Toma Conocimiento': causa.fechaHoraTomaConocimiento ? 
        causa.fechaHoraTomaConocimiento.toISOString().split('T')[0] : 'N/A',
      'RIT': causa.rit || 'N/A',
      'Delito': causa.delito?.nombre || 'N/A',
      'Foco': causa.foco?.nombre || 'N/A',
      'Tribunal': causa.tribunal?.nombre || 'N/A',
      
      // Campos de origen
      'Origen': causa.origenCausa?.nombre || 'Sin Origen',
      'Es ECOH': (causa.origenCausa?.id === ORIGEN_IDS.ECOH_ELQUI || 
                 causa.origenCausa?.id === ORIGEN_IDS.ECOH_LIMARI) ? 'Sí' : 'No',
      'Es SACFI': causa.origenCausa?.id === ORIGEN_IDS.SACFI ? 'Sí' : 'No',
      'Es Legada': causa.origenCausa?.id === ORIGEN_IDS.OTRAS_FISCALIAS ? 'Sí' : 'No',
      
      // Estado de causa
      'Estado Causa': causa.estadoCausa?.nombre || 'Sin Estado',
      'Código Estado': causa.estadoCausa?.codigo || 'N/A',
      
      'Constituye SS': causa.constituyeSs ? 'Sí' : 'No',
      'Homicidio Consumado': causa.homicidioConsumado ? 'Sí' : 'No',
      'Crimen Organizado': causa.esCrimenOrganizado ? 'Sí' : 'No',
      'Cant. Imputados': causa._count.imputados,
      'Cant. Víctimas': causa._count.victimas,
      'Observación': causa.observacion || ''
    }));

    if (formato === 'csv') {
      // ✅ Exportar como CSV optimizado
      if (detalleData.length === 0) {
        return new NextResponse('No hay datos para exportar', {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="reporte-fiscales-vacio.csv"`,
          },
        });
      }

      const headers = Object.keys(detalleData[0]);
      const csvRows = [
        headers.join(','),
        ...detalleData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      return new NextResponse(csvRows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="reporte-fiscales-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });

    } else if (formato === 'xlsx') {
      // ✅ Excel optimizado
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen por Fiscal
      if (resumenData.length > 0) {
        const wsResumen = XLSX.utils.json_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen por Fiscal');
      }

      // Hoja 2: Detalle de Causas
      if (detalleData.length > 0) {
        const wsDetalle = XLSX.utils.json_to_sheet(detalleData);
        XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle de Causas');
      }

      // ✅ Información del reporte optimizada
      const infoReporte = [
        { Campo: 'Fecha de Generación', Valor: new Date().toLocaleString('es-CL') },
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
          (filtros.esCrimenOrganizado ? 'Sí' : 'No') : 'Todos' }
      ];

      const wsInfo = XLSX.utils.json_to_sheet(infoReporte);
      XLSX.utils.book_append_sheet(workbook, wsInfo, 'Info del Reporte');

      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte-fiscales-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },  
      });
    }

    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });

  } catch (error) {
    console.error('Error en exportación de reporte:', error);
    return NextResponse.json(
      { 
        error: 'Error al exportar el reporte', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

// ✅ Helper function optimizada
function getOrigenName(origenId: number): string {
  const origenes = {
    [ORIGEN_IDS.SACFI]: 'SACFI',
    [ORIGEN_IDS.ECOH_ELQUI]: 'ECOH Elqui',
    [ORIGEN_IDS.ECOH_LIMARI]: 'ECOH Limarí',
    [ORIGEN_IDS.OTRAS_FISCALIAS]: 'Otras Fiscalías'
  };

  return origenes[origenId as keyof typeof origenes] || 'Sin Origen';
}