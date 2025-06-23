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
    glosa_cierre?: string; // 🔥 AGREGAR ESTE CAMPO
    usuarioAsignadoId?: string; // 🔥 AGREGAR ESTE CAMPO
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
    glosa_cierre?: string; // 🔥 AGREGAR ESTE CAMPO
    usuarioAsignadoId?: string; // 🔥 AGREGAR ESTE CAMPO
  }
  
  export interface TipoActividad {
    id: number;
    nombre: string;
  }