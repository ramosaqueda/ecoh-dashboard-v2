// lib/origen-helpers.ts - Funciones auxiliares para manejo de orígenes (CORREGIDAS)
export const ORIGEN_IDS = {
  SACFI: 1,
  ECOH_ELQUI: 2,
  ECOH_LIMARI: 3,
  OTRAS_FISCALIAS: 4
} as const;

export type OrigenId = typeof ORIGEN_IDS[keyof typeof ORIGEN_IDS];

/**
 * Convierte filtros obsoletos a nuevos IDs de origen
 */
export function mapLegacyFiltersToOrigin(params: URLSearchParams): OrigenId | undefined {
  if (params.get('causaEcoh') === 'true') return ORIGEN_IDS.ECOH_ELQUI;
  if (params.get('causaSacfi') === 'true') return ORIGEN_IDS.SACFI;
  if (params.get('causaLegada') === 'true') return ORIGEN_IDS.OTRAS_FISCALIAS;
  return undefined;
}

/**
 * Obtiene el nombre del origen basado en su ID
 */
export function getOrigenName(origenId: number | null): string {
  switch (origenId) {
    case ORIGEN_IDS.SACFI: return 'SACFI';
    case ORIGEN_IDS.ECOH_ELQUI: return 'ECOH Elqui';
    case ORIGEN_IDS.ECOH_LIMARI: return 'ECOH Limarí';
    case ORIGEN_IDS.OTRAS_FISCALIAS: return 'Otras Fiscalías';
    default: return 'Sin Origen';
  }
}

/**
 * Verifica si un origen es de tipo ECOH
 */
export function isEcohOrigen(origenId: number | null): boolean {
  return origenId === ORIGEN_IDS.ECOH_ELQUI || origenId === ORIGEN_IDS.ECOH_LIMARI;
}

/**
 * Obtiene el color asociado a un origen (para UI) - MANEJA VALORES NULL
 */
export function getOrigenColor(origenId: number | null): string {
  switch (origenId) {
    case ORIGEN_IDS.SACFI: return '#3B82F6';
    case ORIGEN_IDS.ECOH_ELQUI: return '#10B981';
    case ORIGEN_IDS.ECOH_LIMARI: return '#F59E0B';
    case ORIGEN_IDS.OTRAS_FISCALIAS: return '#6B7280';
    default: return '#9CA3AF';
  }
}

/**
 * Obtiene el color del origen desde la BD, con fallback si es null
 */
export function getColorWithFallback(color: string | null, origenId: number | null): string {
  // Si hay color en la BD, usarlo; si no, usar el color por defecto
  return color || getOrigenColor(origenId);
}

/**
 * Valida si un ID de origen es válido
 */
export function isValidOrigenId(id: number | null): boolean {
  if (id === null) return false;
  return Object.values(ORIGEN_IDS).includes(id as OrigenId);
}

/**
 * Obtiene estadísticas básicas de un origen
 */
export function getOrigenStats(origenId: number | null) {
  return {
    id: origenId,
    nombre: getOrigenName(origenId),
    color: getOrigenColor(origenId),
    isEcoh: isEcohOrigen(origenId),
    isValid: isValidOrigenId(origenId)
  };
}