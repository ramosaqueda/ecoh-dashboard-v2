// causa.ts - Interfaces actualizadas sin enums

// Interfaces básicas para las nuevas entidades
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

// Interfaz para formularios - ACTUALIZADA
export interface CausaFormData {
  // Campos antiguos (mantener temporalmente para compatibilidad)
  causaEcoh?: boolean;
  causaLegada?: boolean;
  
  // Nuevos campos obligatorios
  idOrigen?: number;
  idEstado?: number;
  
  // Resto de campos existentes
  constituyeSs: boolean;
  homicidioConsumado?: boolean;
  fechaHoraTomaConocimiento: string;
  fechaDelHecho: string;
  fechaIta?: string | null;
  fechaPpp?: string | null;
  ruc: string;
  folioBw: string;
  causaId?: string | number;
  coordenadasSs: string;
  delito: number;
  foco: number;
  rit: string;
  tribunal: number;
  denominacionCausa: string;
  fiscalACargo: number;
  abogado: number;
  analista: number;
  atvt: number;
  esCrimenOrganizado: boolean;
  numeroIta: string;
  causasCrimenOrg: number[];
  numeroPpp: string;
  victima: string;
  rut: string;
  nacionalidadVictima: number;
  observacion: string;
}

// Interfaz para el modelo de respuesta - ACTUALIZADA
export interface Causa {
  id: string;
  
  // Campos antiguos (mantener durante transición)
  causaEcoh?: boolean;
  causaLegada?: boolean;
  
  // Nuevos campos
  idOrigen?: number;
  idEstado?: number;
  
  // Nuevas relaciones (opcionales durante migración)
  origen?: OrigenCausa;
  estado?: EstadoCausa;
  
  // Resto de campos existentes
  constituyeSs: boolean;
  homicidioConsumado?: boolean;
  fechaHoraTomaConocimiento: string;
  fechaDelHecho: string;
  fechaIta?: string | null;
  fechaPpp?: string | null;
  ruc: string;
  folioBw: string;
  coordenadasSs?: string;
  rit?: string;
  denominacionCausa: string;
  esCrimenOrganizado: number; // 0 = true, 1 = false, 2 = desconocido
  numeroIta?: string;
  numeroPpp?: string;
  observacion?: string;
  
  // IDs de relaciones existentes
  delitoId: number;
  focoId?: number;
  tribunalId?: number;
  fiscalId?: number;
  abogadoId?: number;
  analistaId?: number;
  atvtId?: number;
  
  // Relaciones existentes
  delito?: {
    id: number;
    nombre: string;
  };
  foco?: {
    id: number;
    nombre: string;
  };
  fiscal?: {
    id: number;
    nombre: string;
  };
  abogado?: {
    id: number;
    nombre: string;
  };
  analista?: {
    id: number;
    nombre: string;
  };
  atvt?: {
    id: number;
    nombre: string;
  };
  tribunal?: {
    id: number;
    nombre: string;
  };
  
  // Relaciones muchos a muchos existentes
  causasCrimenOrg?: Array<{
    causaId: number;
    parametroId: number;
    estado?: boolean;
    parametro?: {
      value: number;
      label: string;
      descripcion?: string;
    };
  }>;
  
  // Metadatos
  createdAt?: string;
  updatedAt?: string;
  
  // Contadores
  _count?: {
    imputados?: number;
    causasRelacionadasMadre?: number;
    causasRelacionadasArista?: number;
  };
}

// Nueva interfaz simplificada para selección en formularios
export interface CausaSimple {
  id: number;
  ruc: string;
  denominacionCausa?: string;
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
}

// Interfaz para crear/editar causa con nuevos campos
export interface CausaCreateUpdate {
  ruc: string;
  denominacionCausa: string;
  idOrigen?: number;
  idEstado?: number;
  // ... otros campos según necesidad
}