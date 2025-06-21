// app/api/reportes/fiscales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  ReporteFiscalesResponse, 
  FiscalReporte, 
  CausaReporteDetalle, 
  ReporteFiltros 
} from '@/types/reporte';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros de filtro
    const filtros: ReporteFiltros = {
      fechaInicio: searchParams.get('fechaInicio') || undefined,
      fechaFin: searchParams.get('fechaFin') || undefined,
      fiscalId: searchParams.get('fiscalId') ? parseInt(searchParams.get('fiscalId')!) : undefined,
      causaEcoh: searchParams.get('causaEcoh') ? searchParams.get('causaEcoh') === 'true' : undefined,
      causaLegada: searchParams.get('causaLegada') ? searchParams.get('causaLegada') === 'true' : undefined,
      esCrimenOrganizado: searchParams.get('esCrimenOrganizado') ? parseInt(searchParams.get('esCrimenOrganizado')!) : undefined,
    };

    // Construir condiciones WHERE
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

    // 1. Obtener todas las causas con relaciones
    const causas = await prisma.causa.findMany({
      where: whereConditions,
      include: {
        fiscal: true,
        delito: true,
        foco: true,
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

    // 3. Calcular estadísticas por fiscal
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

    // Procesar causas y agrupar por fiscal
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
        if (causa.esCrimenOrganizado === 0) stats.totales.crimenOrg++; // 0 = true según comentario en schema
      }
    });

    const totalCausas = causas.length;

    // 4. Crear resumen por fiscal
    const resumenPorFiscal: FiscalReporte[] = Array.from(estadisticasPorFiscal.entries())
      .map(([fiscalId, stats]) => ({
        fiscalId,
        fiscalNombre: stats.fiscal?.nombre || 'Sin Fiscal Asignado',
        totalCausas: stats.totales.total,
        causasEcoh: stats.totales.ecoh,
        causasLegadas: stats.totales.legadas,
        causasConSS: stats.totales.conSS,
        causasHomicidio: stats.totales.homicidio,
        causasCrimenOrg: stats.totales.crimenOrg,
        porcentajeDelTotal: totalCausas > 0 ? (stats.totales.total / totalCausas) * 100 : 0
      }))
      .sort((a, b) => b.totalCausas - a.totalCausas); // Ordenar por cantidad de causas desc

    // 5. Preparar detalle de causas
    const detallesCausas: CausaReporteDetalle[] = causas.map(causa => ({
      id: causa.id,
      ruc: causa.ruc || '',
      denominacionCausa: causa.denominacionCausa,
      fechaDelHecho: causa.fechaDelHecho?.toISOString().split('T')[0] || null,
      fechaHoraTomaConocimiento: causa.fechaHoraTomaConocimiento?.toISOString() || null,
      causaEcoh: causa.causaEcoh,
      causaLegada: causa.causaLegada,
      constituyeSs: causa.constituyeSs,
      homicidioConsumado: causa.homicidioConsumado,
      esCrimenOrganizado: causa.esCrimenOrganizado || 2,
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

    // 7. Preparar respuesta
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
      { error: 'Error al generar el reporte de fiscales', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}