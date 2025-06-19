// types/imputado.ts

export interface Cautelar {
  id: number;
  nombre: string;
}

export interface Delito {
  id: number;
  nombre: string;
}

export interface Tribunal {
  id: number;
  nombre: string;
}

export interface Nacionalidad {
  id: number;
  nombre: string;
}

export interface Causa {
  id: number;
  ruc: string | null;
  denominacionCausa: string;
  delito?: Delito | null;
  tribunal?: Tribunal | null;
}

export interface CausaImputado {
  causaId: number;
  imputadoId: number;
  cautelarId?: number | null;
  fechaFormalizacion?: Date | null;
  formalizado: boolean;
  esimputado: boolean;
  essujetoInteres: boolean;
  plazo?: number | null;
  causa: Causa;
  cautelar?: Cautelar | null;
}

export interface Fotografia {
  id: number;
  url: string | null;
  filename: string;
  esPrincipal: boolean;
  createdAt: Date;
}

export interface ImputadoDetail {
  id: number;
  nombreSujeto: string;
  docId: string;
  nacionalidadId?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  fotoPrincipal?: string | null;
  nacionalidad?: Nacionalidad | null;
  causas?: CausaImputado[];
  fotografias?: Fotografia[];
}
