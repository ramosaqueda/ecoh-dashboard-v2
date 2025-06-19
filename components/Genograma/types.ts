// Tipos de género
export type Genero = 'masculino' | 'femenino';

// Tipos de relaciones
export type TipoRelacion = 'matrimonio' | 'padres' | 'hermanos' | 'primos' | 'divorcio' | 'otro';

// Tipos de roles especiales
export type RolEspecial = 'ninguno' | 'victima' | 'imputado';

// Tipos de ramas familiares
export type RamaFamiliar = 'ninguna' | 'principal' | 'paterna' | 'materna' | 'politica' | 'personalizada';

// Interfaz para persona
export interface Persona {
  id: string;
  nombre: string;
  segundoNombre?: string;
  apellido: string;
  segundoApellido?: string;
  nombreCompleto?: string; // ✅ AGREGADO: Propiedad faltante
  genero: Genero;
  fechaNacimiento?: string;
  fechaFallecimiento?: string;
  esFallecido?: boolean;
  rolEspecial?: RolEspecial;
  ramaFamiliar?: RamaFamiliar;
  colorRama?: string; // Para ramas personalizadas
  nombreRama?: string; // Nombre descriptivo de la rama familiar
}

// Interfaz para relación
export interface Relacion {
  idOrigen: string;
  idDestino: string;
  tipo: TipoRelacion;
  descripcion?: string;
}