// types/victima.ts - Actualizado según schema de Prisma

export interface Victima {
  id: number;
  nombreVictima: string;
  docId: string;
  nacionalidadId?: number;
  causas?: CausaVictima[];
  nacionalidad?: {
    id: number;
    nombre: string;
  };
  // Campos opcionales que pueden venir de queries con _count
  _count?: {
    causas: number;
  };
  causasCount?: number; // Campo personalizado si se calcula manualmente
}

export interface CausaVictima {
  // CausasVictimas usa ID compuesto [causaId, victimaId] - NO tiene campo 'id'
  causaId: number;
  victimaId: number;
  causa: {
    id: number;
    denominacionCausa: string;
    ruc?: string;
    rit?: string;
    delito?: {
      id: number;
      nombre: string;
    };
    tribunal?: {
      id: number;
      nombre: string;
    };
  };
  victima?: {
    id: number;
    nombreVictima: string;
    docId: string;
  };
}

export interface Causa {
  id: number;
  denominacionCausa: string;
  ruc?: string;
  fechaDelHecho?: string;
  rit?: string;
  fechaIta?: string;
  numeroIta?: string;
  fechaPpp?: string;
  numeroPpp?: string;
  observacion?: string;
  foliobw?: string;
  causaEcoh: boolean;
  causaLegada?: boolean;
  coordenadasSs?: string;
  homicidioConsumado?: boolean;
  constituyeSs?: boolean;
  sinLlamadoEcoh?: boolean;
  fechaHoraTomaConocimiento?: string;
  comunaId?: number;
  analistaId?: number;
  atvtId?: number;
  fiscalId?: number;
  focoId?: number;
  delitoId?: number;
  abogadoId?: number;
  esCrimenOrganizado?: number;
  tribunalId?: number;
  nacionalidadVictimaId?: number;
  delito?: {
    id: number;
    nombre: string;
  };
  tribunal?: {
    id: number;
    nombre: string;
  };
  victimas?: CausaVictima[];
}

export interface Nacionalidad {
  id: number;
  nombre: string;
}

// Tipos auxiliares para API responses
export interface CausaVictimaCreateInput {
  causaId: number;
  victimaId: number;
}

export interface CausaVictimaResponse {
  causaId: number;
  victimaId: number;
  causa: Causa;
  victima: Victima;
}

// Agrega este tipo al final de tu archivo types/victima.ts existente:

export interface VictimaDetail {
  id: number;
  nombreVictima: string;
  docId: string;
  nacionalidadId?: number;
  nacionalidad?: {
    id: number;
    nombre: string;
  };
  causas: CausaVictima[];
  // Campos opcionales que pueden venir de queries con _count
  _count?: {
    causas: number;
  };
  causasCount?: number; // Campo personalizado si se calcula manualmente
}