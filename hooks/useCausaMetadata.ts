'use client';

import { useState, useEffect } from 'react';

// Interfaces
interface OrigenCausa {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
}

interface EstadoCausa {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
  orden?: number;
}

interface CausaMetadata {
  origenes: OrigenCausa[];
  estados: EstadoCausa[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para obtener metadatos de causas (orígenes y estados)
 * Evita hardcoding de colores y códigos, obteniendo todo desde la BD
 */
export function useCausaMetadata(): CausaMetadata {
  const [origenes, setOrigenes] = useState<OrigenCausa[]>([]);
  const [estados, setEstados] = useState<EstadoCausa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [origenesRes, estadosRes] = await Promise.all([
          fetch('/api/origenes-causa'),
          fetch('/api/estados-causa')
        ]);

        if (!origenesRes.ok || !estadosRes.ok) {
          throw new Error('Error al cargar metadatos de causas');
        }

        const [origenesData, estadosData] = await Promise.all([
          origenesRes.json(),
          estadosRes.json()
        ]);

        setOrigenes(origenesData || []);
        setEstados(estadosData || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        console.error('Error fetching causa metadata:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  return {
    origenes,
    estados,
    isLoading,
    error
  };
}

/**
 * Utilidades para trabajar con orígenes de causa
 */
export const OrigenCausaUtils = {
  /**
   * Obtiene el color de un origen por código
   */
  getColorByCodigo: (codigo: string, origenes: OrigenCausa[]): string => {
    const origen = origenes.find(o => o.codigo === codigo);
    return origen?.color || '#6b7280';
  },

  /**
   * Obtiene un origen completo por código
   */
  getByCodigo: (codigo: string, origenes: OrigenCausa[]): OrigenCausa | undefined => {
    return origenes.find(o => o.codigo === codigo);
  },

  /**
   * Obtiene un origen completo por ID
   */
  getById: (id: number | string, origenes: OrigenCausa[]): OrigenCausa | undefined => {
    return origenes.find(o => o.id.toString() === id.toString());
  },

  /**
   * Formatea un origen para mostrar (código - nombre)
   */
  format: (origen: OrigenCausa): string => {
    return `${origen.codigo} - ${origen.nombre}`;
  },

  /**
   * Obtiene solo los orígenes activos
   */
  getActivos: (origenes: OrigenCausa[]): OrigenCausa[] => {
    return origenes.filter(o => o.activo);
  }
};

/**
 * Utilidades para trabajar con estados de causa
 */
export const EstadoCausaUtils = {
  /**
   * Obtiene el color de un estado por código
   */
  getColorByCodigo: (codigo: string, estados: EstadoCausa[]): string => {
    const estado = estados.find(e => e.codigo === codigo);
    return estado?.color || '#6b7280';
  },

  /**
   * Obtiene un estado completo por código
   */
  getByCodigo: (codigo: string, estados: EstadoCausa[]): EstadoCausa | undefined => {
    return estados.find(e => e.codigo === codigo);
  },

  /**
   * Obtiene un estado completo por ID
   */
  getById: (id: number | string, estados: EstadoCausa[]): EstadoCausa | undefined => {
    return estados.find(e => e.id.toString() === id.toString());
  },

  /**
   * Formatea un estado para mostrar (código - nombre)
   */
  format: (estado: EstadoCausa): string => {
    return `${estado.codigo} - ${estado.nombre}`;
  },

  /**
   * Obtiene solo los estados activos ordenados
   */
  getActivosOrdenados: (estados: EstadoCausa[]): EstadoCausa[] => {
    return estados
      .filter(e => e.activo)
      .sort((a, b) => (a.orden || 999) - (b.orden || 999));
  },

  /**
   * Genera estilo para badge de estado
   */
  getBadgeStyle: (estado: EstadoCausa) => ({
    backgroundColor: estado.color ? `${estado.color}20` : '#f3f4f6',
    color: estado.color || '#6b7280',
    borderColor: estado.color || '#e5e7eb'
  })
};

/**
 * Hook específico para un origen por ID
 */
export function useOrigenById(id: number | string | null) {
  const { origenes, isLoading } = useCausaMetadata();
  
  const origen = id ? OrigenCausaUtils.getById(id, origenes) : null;
  
  return { origen, isLoading };
}

/**
 * Hook específico para un estado por ID
 */
export function useEstadoById(id: number | string | null) {
  const { estados, isLoading } = useCausaMetadata();
  
  const estado = id ? EstadoCausaUtils.getById(id, estados) : null;
  
  return { estado, isLoading };
}

// Tipos exportados para usar en otros archivos
export type { OrigenCausa, EstadoCausa, CausaMetadata };
