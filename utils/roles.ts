// utils/roles.ts

// Exportamos Role como un enum (para compatibilidad con importaciones existentes)
export enum Role {
  ADMIN = 'ADMIN',
  WRITE = 'WRITE',
  READ = 'READ'
}

// Definimos los roles como constantes (mantenemos esto para compatibilidad con código existente)
export const ROLES = {
  ADMIN: Role.ADMIN,
  WRITE: Role.WRITE,
  READ: Role.READ
} as const;

// Creamos un tipo basado en las constantes (conservamos el tipo para código existente)
export type RoleType = typeof ROLES[keyof typeof ROLES];

// Jerarquía de permisos (cada rol incluye los permisos de los roles inferiores)
export const roleHierarchy: Record<Role, Role[]> = {
  [Role.ADMIN]: [Role.ADMIN, Role.WRITE, Role.READ],
  [Role.WRITE]: [Role.WRITE, Role.READ],
  [Role.READ]: [Role.READ]
};

export const hasPermission = (userRole: string | undefined | null, requiredRole: Role): boolean => {
  // Si no hay rol de usuario, no tiene permisos
  if (!userRole) return false;
  
  // Si el rol de usuario no existe en la jerarquía, no tiene permisos
  if (!Object.values(Role).includes(userRole as Role)) return false;
  
  // Verificar si el rol del usuario incluye el permiso requerido
  return roleHierarchy[userRole as Role].includes(requiredRole);
};

// Custom hook para manejar permisos en componentes
export const usePermissions = (userRole: string | undefined | null) => {
  return {
    isAdmin: () => hasPermission(userRole, Role.ADMIN),
    canWrite: () => hasPermission(userRole, Role.WRITE),
    canRead: () => hasPermission(userRole, Role.READ),
    checkPermission: (requiredRole: Role) => hasPermission(userRole, requiredRole)
  };
};