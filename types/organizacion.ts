import { z } from 'zod';
import { organizacionSchema } from '@/schemas/organizacion.schema';

export type OrganizacionFormValues = z.infer<typeof organizacionSchema>;

export interface Miembro {
  id?: number;
  organizacionId?: number;
  imputadoId: string;
  rol: string;
  orden: number;
  fechaIngreso: Date;
  fechaSalida: Date | null;
  activo?: boolean;
  imputado?: {
    id: number;
    nombreSujeto: string;
    docId: string;
    nacionalidadId?: number;
  };
}

export interface CausaAsociada {
  id?: number;
  organizacionId?: number;
  causaId: number;
  ruc?: string;
  denominacion?: string;
  fechaAsociacion: Date;
  observacion?: string;
  causa?: {
    id: number;
    ruc?: string;
    denominacionCausa: string;
    delito?: {
      id: number;
      nombre: string;
    };
  };
}

export interface Imputado {
  id: string;
  nombreSujeto: string;
  docId?: string;
}

export interface TipoOrganizacion {
  id: string;
  nombre: string;
}

export interface OrganizacionFormProps {
  initialData?: Partial<OrganizacionFormValues> & {
    miembros?: Miembro[];
    causas?: CausaAsociada[];
  };
  onSubmit: (data: OrganizacionFormValues) => Promise<void>;
}