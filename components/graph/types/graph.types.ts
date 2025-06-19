// components/graph/types/graph.types.ts
export interface Organization {
    id: number;
    nombre: string;
    descripcion?: string;
    fechaIdentificacion: Date;
    activa: boolean;
    tipoOrganizacionId: number;
    tipoOrganizacion?: {
      id: number;
      nombre: string;
    };
    miembros?: Member[];
    createdAt: Date;
  }
  
  export interface Member {
    id: number;
    imputadoId: number;
    rol?: string;
    fechaIngreso: Date;
    fechaSalida?: Date | null;
    activo: boolean;
    imputado: Imputado;
  }
  
  export interface Imputado {
    id: number;
    nombreSujeto: string;
    docId: string;
    nacionalidad?: {
      id: number;
      nombre: string;
    };
  }
  
  export interface GraphNode {
    id: string;
    name: string;
    val: number;
    type: 'organization' | 'imputado';
    color: string;
    org?: Organization;
    imputado?: Imputado;
    x?: number;
    y?: number;
  }
  
  export interface GraphLink {
    source: string;
    target: string;
    value: number;
    rol?: string;
  }
  
  export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
  }
  
  export interface GraphFilters {
    searchTerm: string;
    tipoOrganizacion: string;
    showActiveOnly: boolean;
  }