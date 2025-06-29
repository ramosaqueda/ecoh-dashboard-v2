// actividades.ts - Interfaces actualizadas

// Nuevas interfaces para las entidades paramétricas
export interface OrigenCausa {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface EstadoCausa {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

// Interfaz actualizada para Actividad - manteniendo compatibilidad
export interface Actividad {
  id: number;
  causa: {
    id: number;
    ruc: string;
    // Nuevos campos (opcionales para compatibilidad durante migración)
    origen?: {
      id: number;
      codigo: string;
      nombre: string;
    };
    estado?: {
      id: number;
      codigo: string;
      nombre: string;
    };
    // Campos antiguos (mantener temporalmente)
    causaEcoh?: boolean;
    causaLegada?: boolean;
  };
  tipoActividad: {
    id: number;
    nombre: string;
    // Incluir área si está disponible
    area?: {
      id: number;
      nombre: string;
    };
  };
  fechaInicio: string;
  fechaTermino: string;
  observacion: string;
  glosa_cierre?: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  usuario: {
    id: number;
    nombre: string;
    email: string;
  };
  usuarioAsignado?: {
    id: number;
    nombre: string;
    email: string;
    rol?: {
      id: number;
      nombre: string;
    };
  };
  usuarioAsignadoId?: number;
}

// Interfaz para edición - actualizada
export interface ActividadEditing {
  id: number;
  causaId: string;
  tipoActividadId: string;
  fechaInicio: string;
  fechaTermino: string;
  estado: 'inicio' | 'en_proceso' | 'terminado';
  observacion?: string;
  glosa_cierre?: string;
  usuarioAsignadoId?: string;
}

// Mantener interfaz existente
export interface TipoActividad {
  id: number;
  nombre: string;
  area?: {
    id: number;
    nombre: string;
  };
}

// Nuevas interfaces para formularios y filtros
export interface CausaForSelect {
  id: number;
  ruc: string;
  origen: {
    nombre: string;
  };
  estado: {
    nombre: string;
  };
}

// Para filtros
export interface FiltrosActividad {
  ruc?: string;
  tipoActividadId?: string;
  origenId?: string;
  estadoCausaId?: string;
  estadoActividad?: string;
  usuarioAsignadoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Metadata para paginación (ya existente, pero la incluyo para completitud)
export interface MetadataPaginacion {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}