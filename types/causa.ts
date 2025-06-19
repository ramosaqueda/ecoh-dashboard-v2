// causa.ts
export interface CausaFormData {
  causaEcoh: boolean;
  causaLegada: boolean;
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

  numeroIta: string;
  causasCrimenOrg: number[];
  
  numeroPpp: string;
  victima: string;
  rut: string;
  nacionalidadVictima: number;
  observacion: string;
}

// Definición de la interfaz Causa para representar el modelo de respuesta del servidor
export interface Causa {
  id: number;
  causaEcoh: boolean;
  causaLegada: boolean;
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