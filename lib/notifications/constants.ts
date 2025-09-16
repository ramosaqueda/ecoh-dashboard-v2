// ==========================================
// ARCHIVO: /lib/notifications/constants.ts
// ==========================================

// Tipos de notificación (EXACTAMENTE como están en schema.prisma)
export const NOTIFICATION_TYPES = {
  ACTIVIDAD_NUEVA: 'actividad_nueva' as const,
  ACTIVIDAD_ACTUALIZADA: 'actividad_actualizada' as const
} as const;

// Prioridades (EXACTAMENTE como están en schema.prisma) 
export const NOTIFICATION_PRIORITIES = {
  BAJO: 'bajo' as const,
  MEDIO: 'medio' as const, 
  ALTA: 'alta' as const,
  CRITICA: 'critica' as const
} as const;

// Configuración de expiración (en milisegundos)
export const EXPIRATION_TIMES = {
  STANDARD: 30 * 24 * 60 * 60 * 1000,     // 30 días
  OVERDUE: 7 * 24 * 60 * 60 * 1000,       // 7 días para vencidas
  CRITICAL: 3 * 24 * 60 * 60 * 1000       // 3 días para críticas
} as const;

// Mensajes predefinidos (en español para UI)
export const NOTIFICATION_MESSAGES = {
  ACTIVITY_ASSIGNED: (tipoActividad: string, causaRuc: string) => 
    `Se te ha asignado la actividad "${tipoActividad}" para la causa ${causaRuc}`,
    
  ACTIVITY_UPDATED: (tipoActividad: string, causaRuc: string, changes: string[]) =>
    `Tu actividad "${tipoActividad}" (${causaRuc}) ha sido actualizada. Cambios: ${changes.join(', ')}`,
    
  ACTIVITY_OVERDUE: (tipoActividad: string, causaRuc: string, daysPastDue: number) =>
    `Tu actividad "${tipoActividad}" (${causaRuc}) venció hace ${daysPastDue} día${daysPastDue > 1 ? 's' : ''}.`
} as const;

// Títulos predefinidos (en español para UI)
export const NOTIFICATION_TITLES = {
  NEW_ASSIGNMENT: 'Nueva Actividad Asignada',
  ACTIVITY_UPDATED: 'Actividad Actualizada', 
  ACTIVITY_OVERDUE: '⚠️ Actividad Vencida',
  ACTIVITY_DUE_SOON: '⏰ Actividad Próxima a Vencer'
} as const;
