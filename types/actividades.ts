// types.ts

export interface Actividad {
    id: number;
    causa: {
      id: number;
      ruc: string;
    };
    tipoActividad: {
      id: number;
      nombre: string;
    };
    fechaInicio: string;
    fechaTermino: string;
    observacion: string;
    estado: 'inicio' | 'en_proceso' | 'terminado';
    usuario: {
      email: string;
    };
  }
  
  export interface ActividadEditing {
    id: number;
    causaId: string;
    tipoActividadId: string;
    fechaInicio: string;
    fechaTermino: string;
    estado: 'inicio' | 'en_proceso' | 'terminado';
    observacion?: string;
  }
  
  export interface TipoActividad {
    id: number;
    nombre: string;
  }