// app/api/reportes/fiscales/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { ReporteFiltros } from '@/types/reporte';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros
    const formato = searchParams.get('formato') as 'xlsx' | 'csv';
    const filtros: ReporteFiltros = {
      fechaInicio: searchParams.get('fechaInicio') || undefined,
      fechaFin: searchParams.get('fechaFin') || undefined,
      fiscalId: searchParams.get('fiscalId') ? parseInt(searchParams.get('fiscalId')!) : undefined,
      causaEcoh: searchParams.get('causaEcoh') ? searchParams.get('causaEcoh') === 'true' : undefined,
      causaLegada: searchParams.get('causaLegada') ? searchParams.get('causaLegada') === 'true' : undefined,
      esCrimenOrganizado: searchParams.get('esCrimenOrganizado') ? parseInt(searchParams.get('esCrimenOrganizado')!) : undefined,
    };

    if (!formato || !['xlsx', 'csv'].includes(formato)) {
      return NextResponse.json({ error: 'Formato no válido' }, { status: 400 });
    }

    // Construir condiciones WHERE (misma lógica que en el reporte principal)
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
    
    if (filtros.causaEcoh !== undefined) {
      whereConditions.causaEcoh = filtros.causaEcoh;
    }
    
    if (filtros.causaLegada !== undefined) {
      whereConditions.causaLegada = filtros.causaLegada;
    }
    
    if (filtros.esCrimenOrganizado !== undefined) {
      whereConditions.esCrimenOrganizado = filtros.esCrimenOrganizado;
    }

    // Obtener datos
    const [causas, todosFiscales] = await Promise.all([
      prisma.causa.findMany({
        where: whereConditions,
        include: {
          fiscal: true,
          delito: true,
          foco: true,
          tribunal: true,
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

    // Preparar datos para resumen por fiscal
    const estadisticasPorFiscal = new Map<number | null, {
      fiscal: { id: number; nombre: string } | null;
      causas: typeof causas;
      totales: {
        total: number;
        ecoh: number;
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
        totales: { total: 0, ecoh: 0, legadas: 0, conSS: 0, homicidio: 0, crimenOrg: 0 }
      });
    });

    // Agregar entrada para causas sin fiscal
    estadisticasPorFiscal.set(null, {
      fiscal: null,
      causas: [],
      totales: { total: 0, ecoh: 0, legadas: 0, conSS: 0, homicidio: 0, crimenOrg: 0 }
    });

    // Procesar causas
    causas.forEach(causa => {
      const fiscalId = causa.fiscalId;
      const stats = estadisticasPorFiscal.get(fiscalId);
      
      if (stats) {
        stats.causas.push(causa);
        stats.totales.total++;
        
        if (causa.causaEcoh) stats.totales.ecoh++;
        if (causa.causaLegada) stats.totales.legadas++;
        if (causa.constituyeSs) stats.totales.conSS++;
        if (causa.homicidioConsumado) stats.totales.homicidio++;
        if (causa.esCrimenOrganizado === 0) stats.totales.crimenOrg++;
      }
    });

    // Preparar datos para exportación

    // 1. Hoja de Resumen por Fiscal
    const resumenData = Array.from(estadisticasPorFiscal.entries())
      .map(([fiscalId, stats]) => ({
        'ID Fiscal': fiscalId || 'N/A',
        'Nombre Fiscal': stats.fiscal?.nombre || 'Sin Fiscal Asignado',
        'Total Causas': stats.totales.total,
        'Causas ECOH': stats.totales.ecoh,
        'Causas Legadas': stats.totales.legadas,
        'Causas con SS': stats.totales.conSS,
        'Homicidios': stats.totales.homicidio,
        'Crimen Organizado': stats.totales.crimenOrg,
        'Porcentaje del Total': causas.length > 0 ? ((stats.totales.total / causas.length) * 100).toFixed(2) + '%' : '0%'
      }))
      .filter(item => item['Total Causas'] > 0)
      .sort((a, b) => b['Total Causas'] - a['Total Causas']);

    // 2. Hoja de Detalle de Causas
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
      'Es ECOH': causa.causaEcoh ? 'Sí' : 'No',
      'Es Legada': causa.causaLegada ? 'Sí' : (causa.causaLegada === false ? 'No' : 'N/A'),
      'Constituye SS': causa.constituyeSs ? 'Sí' : (causa.constituyeSs === false ? 'No' : 'N/A'),
      'Homicidio Consumado': causa.homicidioConsumado ? 'Sí' : (causa.homicidioConsumado === false ? 'No' : 'N/A'),
      'Crimen Organizado': causa.esCrimenOrganizado === 0 ? 'Sí' : (causa.esCrimenOrganizado === 1 ? 'No' : 'Desconocido'),
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
          'Content-Disposition': `attachment; filename="reporte-fiscales-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });

    } else if (formato === 'xlsx') {
      // Exportar como Excel con múltiples hojas
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen por Fiscal
      const wsResumen = XLSX.utils.json_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen por Fiscal');

      // Hoja 2: Detalle de Causas
      const wsDetalle = XLSX.utils.json_to_sheet(detalleData);
      XLSX.utils.book_append_sheet(workbook, wsDetalle, 'Detalle de Causas');

      // Hoja 3: Información del Reporte
      const infoReporte = [
        { Campo: 'Fecha de Generación', Valor: new Date().toLocaleString() },
        { Campo: 'Total de Causas', Valor: causas.length },
        { Campo: 'Fiscales con Causas', Valor: resumenData.length },
        { Campo: 'Filtros Aplicados', Valor: '' },
        { Campo: 'Fecha Inicio', Valor: filtros.fechaInicio || 'No aplicado' },
        { Campo: 'Fecha Fin', Valor: filtros.fechaFin || 'No aplicado' },
        { Campo: 'Fiscal Específico', Valor: filtros.fiscalId ? `ID: ${filtros.fiscalId}` : 'Todos' },
        { Campo: 'Solo ECOH', Valor: filtros.causaEcoh !== undefined ? (filtros.causaEcoh ? 'Sí' : 'No') : 'Todos' },
        { Campo: 'Solo Legadas', Valor: filtros.causaLegada !== undefined ? (filtros.causaLegada ? 'Sí' : 'No') : 'Todos' },
        { Campo: 'Crimen Organizado', Valor: filtros.esCrimenOrganizado !== undefined ? 
          (filtros.esCrimenOrganizado === 0 ? 'Sí' : filtros.esCrimenOrganizado === 1 ? 'No' : 'Desconocido') : 'Todos' }
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
    console.error('Error en exportación:', error);
    return NextResponse.json(
      { error: 'Error al exportar el reporte', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}