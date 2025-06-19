// types/reporte.ts
import { Causa } from './causa';

// Datos agregados por fiscal
export interface FiscalReporte {
  fiscalId: number | null;
  fiscalNombre: string;
  totalCausas: number;
  causasEcoh: number;
  causasLegadas: number;
  causasConSS: number; // constituyeSs
  causasHomicidio: number;
  causasCrimenOrg: number;
  porcentajeDelTotal: number;
}

// Causa simplificada para el detalle del reporte
export interface CausaReporteDetalle {
  id: number;
  ruc: string;
  denominacionCausa: string;
  fechaDelHecho: string | null;
  fechaHoraTomaConocimiento: string | null;
  causaEcoh: boolean;
  causaLegada: boolean | null;
  constituyeSs: boolean | null;
  homicidioConsumado: boolean | null;
  esCrimenOrganizado: number;
  rit: string | null;
  fiscal: {
    id: number;
    nombre: string;
  } | null;
  delito: {
    id: number;
    nombre: string;
  } | null;
  foco: {
    id: number;
    nombre: string;
  } | null;
  _count: {
    imputados: number;
    victimas: number;
  };
}

// Parámetros de filtro para el reporte
export interface ReporteFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  fiscalId?: number;
  causaEcoh?: boolean;
  causaLegada?: boolean;
  esCrimenOrganizado?: number;
}

// Respuesta completa del API de reporte
export interface ReporteFiscalesResponse {
  resumenPorFiscal: FiscalReporte[];
  detallesCausas: CausaReporteDetalle[];
  totalCausas: number;
  fechaGeneracion: string;
  filtrosAplicados: ReporteFiltros;
  estadisticasGenerales: {
    fiscalesConCausas: number;
    fiscalesSinCausas: number;
    causasSinFiscal: number;
    promedioCausasPorFiscal: number;
  };
}

// Datos para el gráfico
export interface DatoGrafico {
  fiscal: string;
  causas: number;
  causasEcoh: number;
  causasLegadas: number;
  causasCrimenOrg: number;
}

// Opciones de exportación
export interface OpcionesExportacion {
  formato: 'xlsx' | 'csv' | 'pdf';
  incluirDetalle: boolean;
  incluirGraficos: boolean;
  filtros: ReporteFiltros;
}