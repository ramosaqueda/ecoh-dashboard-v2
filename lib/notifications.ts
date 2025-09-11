// lib/notifications.ts
import { prisma } from '@/lib/prisma';

export interface CreateNotificationData {
  userId: number;
  title: string;
  message: string;
  type: 'activity_assigned' | 'activity_updated' | 'activity_pending' | 'system';
  metadata?: {
    activityId?: number;
    activityType?: string;
    ruc?: string;
    assignedBy?: string;
    status?: string;
    dueDate?: string;
  };
}

/**
 * Creates a notification for activity assignment
 */
export async function createActivityAssignmentNotification(
  userId: number,
  activityId: number,
  activityType: string,
  assignedBy: string,
  ruc?: string
) {
  try {
    const notification = await prisma.notificacion.create({
      data: {
        usuario_id: userId,
        titulo: 'Nueva Actividad Asignada',
        mensaje: `Se te ha asignado la actividad "${activityType}" ${ruc ? `en la causa ${ruc}` : ''}`,
        tipo: 'activity_assigned',
        leida: false,
        metadata: JSON.stringify({
          activityId,
          activityType,
          ruc,
          assignedBy
        })
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating activity assignment notification:', error);
    throw error;
  }
}

/**
 * Creates a notification for activity status update
 */
export async function createActivityUpdateNotification(
  userId: number,
  activityId: number,
  activityType: string,
  updatedBy: string,
  action: 'updated' | 'completed' | 'reassigned',
  ruc?: string
) {
  try {
    const actionMessages = {
      updated: 'actualizada',
      completed: 'completada',
      reassigned: 'reasignada'
    };

    const notification = await prisma.notificacion.create({
      data: {
        usuario_id: userId,
        titulo: `Actividad ${actionMessages[action]}`,
        mensaje: `La actividad "${activityType}" ha sido ${actionMessages[action]} ${ruc ? `en la causa ${ruc}` : ''}`,
        tipo: 'activity_updated',
        leida: false,
        metadata: JSON.stringify({
          activityId,
          activityType,
          ruc,
          updatedBy,
          action
        })
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating activity update notification:', error);
    throw error;
  }
}

/**
 * Creates a notification for pending activities (due soon or overdue)
 */
export async function createPendingActivityNotification(
  userId: number,
  activityId: number,
  activityType: string,
  dueDate: string,
  isOverdue: boolean = false,
  ruc?: string
) {
  try {
    const title = isOverdue ? 'Actividad Vencida' : 'Actividad Próxima a Vencer';
    const message = isOverdue 
      ? `La actividad "${activityType}" está vencida ${ruc ? `en la causa ${ruc}` : ''}`
      : `La actividad "${activityType}" vence pronto ${ruc ? `en la causa ${ruc}` : ''}`;

    const notification = await prisma.notificacion.create({
      data: {
        usuario_id: userId,
        titulo: title,
        mensaje: message,
        tipo: 'activity_pending',
        leida: false,
        metadata: JSON.stringify({
          activityId,
          activityType,
          ruc,
          dueDate,
          isOverdue
        })
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating pending activity notification:', error);
    throw error;
  }
}

/**
 * Creates a generic notification
 */
export async function createGenericNotification(data: CreateNotificationData) {
  try {
    const notification = await prisma.notificacion.create({
      data: {
        usuario_id: data.userId,
        titulo: data.title,
        mensaje: data.message,
        tipo: data.type,
        leida: false,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating generic notification:', error);
    throw error;
  }
}

/**
 * Get updated notification stats for a user
 */
export async function getUpdatedNotificationStats(userId: number) {
  try {
    const [total, unread] = await Promise.all([
      prisma.notificacion.count({
        where: { usuario_id: userId }
      }),
      prisma.notificacion.count({
        where: { 
          usuario_id: userId,
          leida: false 
        }
      })
    ]);

    return { total, unread };
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return { total: 0, unread: 0 };
  }
}
