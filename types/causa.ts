// causa.ts

// Nuevos tipos para Origen y Estado de Causa
export interface OrigenCausa {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  color?: string | null;
  codigo: string; // Campo virtual para compatibilidad con el componente
  createdAt: string;
  updatedAt: string;
}

export interface EstadoCausa {
  id: number;
  nombre: string;
  descripcion?: string | null;
  codigo: string;
  activo: boolean;
  orden?: number | null;
  color?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CausaFormData {
  constituyeSs: boolean;
  homicidioConsumado?: boolean;
  fechaHoraTomaConocimiento: string;
  fechaDelHecho: string;
  fechaIta?: string | null;
  fechaPpp?: string | null;
  ruc: string;
  folioBw: string;
  causaId?: string; // ✅ Agregar esta línea
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
  // Nuevos campos para origen y estado
  origenCausaId?: number;
  estadoCausaId?: number;

  numeroIta: string;
  causasCrimenOrg: number[];
  
  numeroPpp: string;
  victima: string;
  rut: string;
  nacionalidadVictima: number;
  observacion: string;
  oficialACargo?: string;
  unidadPolicialId?: number;
}

// Definición de la interfaz Causa para representar el modelo de respuesta del servidor
export interface Causa {
  id: number;
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
  
  // IDs de relaciones
  delitoId: number;
  focoId?: number;
  tribunalId?: number;
  fiscalId?: number;
  abogadoId?: number;
  analistaId?: number;
  atvtId?: number;
  origenCausaId?: number;
  estadoCausaId?: number;
  unidadPolicialId?: number;
  oficialACargo?: string;
  
  // Relaciones
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
  origenCausa?: {
    id: number;
    nombre: string;
    codigo: string;
    color?: string | null;
  };
  estadoCausa?: {
    id: number;
    nombre: string;
    codigo: string;
    color?: string | null;
  };
  unidadPolicial?: {
    id: number;
    nombre: string;
    institucion?: string | null;
  };
  
  // Relaciones muchos a muchos
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