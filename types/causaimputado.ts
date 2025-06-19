// types/causaimputado.ts

/**
 * Representa una causa en el sistema judicial
 */
export type Causa = {
  id: number;
  denominacionCausa: string;
  ruc: string | null;
  rit: string | null;
  tribunal?: {
    id: number;
    nombre: string;
  };
  delito?: {
    id: number;
    nombre: string;
  };
};

/**
 * Representa una medida cautelar que puede ser asignada a un imputado
 */
export type Cautelar = {
  id: number;
  nombre: string;
};

/**
 * Representa la relación entre una causa y un imputado
 */
export interface CausaImputado {
  id: string;
  causaId: number;
  imputadoId: number;
  esImputado: boolean;
  essujetoInteres: boolean;
  formalizado: boolean;
  fechaFormalizacion: string | null;
  plazo: number | null; // Nuevo campo
  cautelarId: number | null;
  causa?: {
    ruc: string;
    denominacionCausa?: string;
    // ... otros campos
  };
  imputado?: {
    nombreSujeto: string;
  };
  cautelar?: {
    nombre: string;
  };
  principalImputado?: boolean; // ✅ Agregar esta propiedad

}
/**
 * Representa los valores del formulario para crear/editar una relación causa-imputado
 */
export interface CausaImputadoFormValues {
  causaId: string;
  esImputado: boolean;
  essujetoInteres: boolean;
  formalizado: boolean;
  fechaFormalizacion: Date | null;
  plazo: number | null; // Nuevo campo
  cautelarId?: string | null;
}

/**
 * Representa un imputado en el sistema
 */
export type Imputado = {
  id: number;
  nombreSujeto: string;
  docId: string;
  alias?:string;
  caracteristicas?:string;
  nacionalidadId: number | null;
  nacionalidad?: {
    id: number;
    nombre: string;
  };
  causas: CausaImputado[];
};
