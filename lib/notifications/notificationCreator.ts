// ==========================================
// ARCHIVO: /lib/notifications/notificationCreator.ts
// ==========================================

import { prisma } from '@/lib/prisma';
import { 
  NOTIFICATION_TYPES, 
  NOTIFICATION_PRIORITIES, 
  EXPIRATION_TIMES,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TITLES 
} from './constants';

// Tipos específicos para las consultas Prisma - CORREGIDOS
type ActividadCompleta = {
  id: number;
  fechaTermino: Date;
  causa: {
    ruc: string | null;
    denominacionCausa?: string | null;
  } | null;  // ✅ CAUSA PUEDE SER NULL
  tipoActividad: {
    nombre: string;
  };
  usuarioAsignado: {
    id: number;
    nombre: string;
    email: string;
  } | null;
};

export class NotificationCreator {
  
  // Crear notificación cuando se asigna una nueva actividad
  static async createActivityAssignedNotification(
    activityId: number,
    assignedUserId: number,
    createdByUserId?: number
  ) {
    try {
      // Obtener datos completos de la actividad con tipos explícitos
      const actividad: ActividadCompleta | null = await prisma.actividad.findUnique({
        where: { id: activityId },
        include: {
          causa: {
            select: { 
              ruc: true, 
              denominacionCausa: true 
            }
          },
          tipoActividad: {
            select: { nombre: true }
          },
          usuarioAsignado: {
            select: { 
              id: true, 
              nombre: true, 
              email: true 
            }
          }
        }
      });

      if (!actividad || !actividad.usuarioAsignado) {
        console.warn(`No se pudo crear notificación: actividad ${activityId} no encontrada o sin usuario asignado`);
        return;
      }

      // No notificar si el usuario se asignó la actividad a sí mismo
      if (createdByUserId && createdByUserId === assignedUserId) {
        console.log(`No se crea notificación: usuario ${assignedUserId} se auto-asignó la actividad`);
        return;
      }

      // Determinar prioridad basada en fecha de término
      const priority = this.calculatePriority(actividad.fechaTermino);

      // Crear notificación con tipos explícitos
      const notificationId = `act-new-${activityId}-${Date.now()}`;
      
      const notificationData = {
        id: notificationId,
        type: NOTIFICATION_TYPES.ACTIVIDAD_NUEVA,
        title: NOTIFICATION_TITLES.NEW_ASSIGNMENT,
        message: NOTIFICATION_MESSAGES.ACTIVITY_ASSIGNED(
          actividad.tipoActividad.nombre,
          actividad.causa?.ruc || 'N/A',
        ),
        priority,
        userId: assignedUserId,
        userEmail: actividad.usuarioAsignado.email,
        actividadId: activityId,
        metadata: {
          causaRuc: actividad.causa?.ruc || null, // ✅ Optional chaining
          causaDenominacion: actividad.causa?.denominacionCausa || null,
          tipoActividad: actividad.tipoActividad.nombre,
          fechaTermino: actividad.fechaTermino.toISOString(),
          createdBy: createdByUserId || null
        },
        expiresAt: new Date(Date.now() + EXPIRATION_TIMES.STANDARD)
      };

      await prisma.notification.create({
        data: notificationData
      });

      console.log(`✅ Notificación creada: ${notificationId} para usuario ${actividad.usuarioAsignado.nombre}`);
      
      return notificationId;

    } catch (error) {
      console.error('Error creating activity assigned notification:', error);
    }
  }

  // Crear notificación cuando se actualiza una actividad
  static async createActivityUpdatedNotification(
    activityId: number,
    assignedUserId: number,
    updatedByUserId: number,
    changes: string[]
  ) {
    try {
      // No notificar si el usuario actualizó su propia actividad
      if (updatedByUserId === assignedUserId) {
        console.log(`No se crea notificación: usuario ${assignedUserId} actualizó su propia actividad`);
        return;
      }

      // Obtener datos de la actividad con tipos explícitos
      const actividad: ActividadCompleta | null = await prisma.actividad.findUnique({
        where: { id: activityId },
        include: {
          causa: {
            select: { 
              ruc: true, 
              denominacionCausa: true 
            }
          },
          tipoActividad: {
            select: { nombre: true }
          },
          usuarioAsignado: {
            select: { 
              id: true, 
              nombre: true, 
              email: true 
            }
          }
        }
      });

      if (!actividad || !actividad.usuarioAsignado) {
        console.warn(`No se pudo crear notificación: actividad ${activityId} no encontrada o sin usuario asignado`);
        return;
      }

      // Determinar prioridad basada en fecha de término
      const priority = this.calculatePriority(actividad.fechaTermino);

      const notificationId = `act-upd-${activityId}-${Date.now()}`;

      const notificationData = {
        id: notificationId,
        type: NOTIFICATION_TYPES.ACTIVIDAD_ACTUALIZADA,
        title: NOTIFICATION_TITLES.ACTIVITY_UPDATED,
        message: NOTIFICATION_MESSAGES.ACTIVITY_UPDATED(
          actividad.tipoActividad.nombre,
          actividad.causa?.ruc || 'N/A',
          changes
        ),
        priority,
        userId: assignedUserId,
        userEmail: actividad.usuarioAsignado.email,
        actividadId: activityId,
        metadata: {
          causaRuc: actividad.causa?.ruc || null, // ✅ Optional chaining
          causaDenominacion: actividad.causa?.denominacionCausa || null,
          tipoActividad: actividad.tipoActividad.nombre,
          changes,
          updatedBy: updatedByUserId,
          updatedAt: new Date().toISOString()
        },
        expiresAt: new Date(Date.now() + EXPIRATION_TIMES.STANDARD)
      };

      await prisma.notification.create({
        data: notificationData
      });

      console.log(`✅ Notificación de actualización creada: ${notificationId} para usuario ${actividad.usuarioAsignado.nombre}`);
      
      return notificationId;

    } catch (error) {
      console.error('Error creating activity updated notification:', error);
    }
  }

  // Calcular prioridad basada en fecha de término
  private static calculatePriority(fechaTermino: Date) {
    const now = new Date();
    const diffMs = fechaTermino.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return NOTIFICATION_PRIORITIES.CRITICA;
    } else if (diffDays <= 3) {
      return NOTIFICATION_PRIORITIES.ALTA;
    } else if (diffDays <= 7) {
      return NOTIFICATION_PRIORITIES.MEDIO;
    } else {
      return NOTIFICATION_PRIORITIES.BAJO;
    }
  }

  // Crear notificación de actividad vencida (para ejecutar en cron job)
  static async createOverdueActivityNotifications() {
    try {
      const now = new Date();
      
      // Buscar actividades vencidas que no están terminadas
      const overdueActivities = await prisma.actividad.findMany({
        where: {
          fechaTermino: {
            lt: now
          },
          estado: {
            not: 'terminado'
          },
          usuario_asignado_id: {
            not: null
          }
        },
        include: {
          causa: {
            select: { 
              ruc: true, 
              denominacionCausa: true 
            }
          },
          tipoActividad: {
            select: { nombre: true }
          },
          usuarioAsignado: {
            select: { 
              id: true, 
              nombre: true, 
              email: true 
            }
          }
        }
      });

      const notifications = [];

      for (const actividad of overdueActivities) {
        if (!actividad.usuarioAsignado) continue;

        // Verificar si ya existe una notificación reciente de vencimiento
        const existingNotification = await prisma.notification.findFirst({
          where: {
            actividadId: actividad.id,
            type: NOTIFICATION_TYPES.ACTIVIDAD_ACTUALIZADA,
            userId: actividad.usuarioAsignado.id,
            dismissed: false,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
            },
            metadata: {
              path: ['isOverdue'],
              equals: true
            }
          }
        });

        if (existingNotification) {
          console.log(`Notificación de vencimiento ya existe para actividad ${actividad.id}`);
          continue;
        }

        const daysPastDue = Math.ceil((now.getTime() - actividad.fechaTermino.getTime()) / (1000 * 60 * 60 * 24));
        const notificationId = `act-overdue-${actividad.id}-${Date.now()}`;

        const notificationData = {
          id: notificationId,
          type: NOTIFICATION_TYPES.ACTIVIDAD_ACTUALIZADA,
          title: NOTIFICATION_TITLES.ACTIVITY_OVERDUE,
          message: NOTIFICATION_MESSAGES.ACTIVITY_OVERDUE(
            actividad.tipoActividad.nombre,
            actividad.causa?.ruc || 'N/A',
            daysPastDue
          ),
          priority: NOTIFICATION_PRIORITIES.CRITICA,
          userId: actividad.usuarioAsignado.id,
          userEmail: actividad.usuarioAsignado.email,
          actividadId: actividad.id,
          metadata: {
            isOverdue: true,
            daysPastDue,
            originalDueDate: actividad.fechaTermino.toISOString(),
            causaRuc: actividad.causa?.ruc || null, // ✅ Optional chaining
            tipoActividad: actividad.tipoActividad.nombre
          },
          expiresAt: new Date(Date.now() + EXPIRATION_TIMES.OVERDUE)
        };

        const notification = await prisma.notification.create({
          data: notificationData
        });

        notifications.push(notification);
      }

      console.log(`✅ Creadas ${notifications.length} notificaciones de actividades vencidas`);
      return notifications;

    } catch (error) {
      console.error('Error creating overdue activity notifications:', error);
      return [];
    }
  }

  // Limpiar notificaciones para actividad eliminada
  static async cleanupNotificationsForDeletedActivity(activityId: number) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          actividadId: activityId,
          dismissed: false
        },
        data: {
          dismissed: true
        }
      });

      console.log(`🧹 Limpiadas ${result.count} notificaciones para actividad eliminada ${activityId}`);
      return result.count;

    } catch (error) {
      console.error('Error cleaning up notifications for deleted activity:', error);
      return 0;
    }
  }
}