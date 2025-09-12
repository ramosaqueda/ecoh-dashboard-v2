// lib/notifications/notificationService.ts - VERSIÓN LIMPIA Y MEJORADA

import { eventManager } from './eventManager';
import { 
  Notification, 
  NotificationFilter,
  ActividadAsignadaNotification,
  EstadoCambiadoNotification 
} from './types';

export class NotificationService {
  async notifyActividadAsignada(
    usuarioAsignadoEmail: string,
    asignadoPorEmail: string,
    actividad: {
      id: number;
      causaRuc: string;
      tipoActividad: string;
      fechaInicio: string;
    }
  ): Promise<void> {
    if (!usuarioAsignadoEmail || !actividad.id) return;

    try {
      const notification: ActividadAsignadaNotification = {
        id: this.generateNotificationId('actividad', actividad.id),
        type: 'actividad_asignada',
        title: 'Nueva Actividad Asignada',
        message: `Se te ha asignado una nueva actividad: ${actividad.tipoActividad} para la causa ${actividad.causaRuc}`,
        priority: 'high',
        userId: usuarioAsignadoEmail,
        read: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          actividadId: actividad.id,
          causaRuc: actividad.causaRuc,
          tipoActividad: actividad.tipoActividad,
          asignadoPor: asignadoPorEmail,
          fechaInicio: actividad.fechaInicio
        }
      };

      eventManager.sendToUser(usuarioAsignadoEmail, notification);
    } catch (error) {
      // Log error but don't throw - notification failures shouldn't break the main flow
      console.error('Failed to send activity notification:', error);
    }
  }

  async notifyEstadoCambiado(
    usuarioAsignadorEmail: string,
    cambiadoPorEmail: string,
    actividad: {
      id: number;
      causaRuc: string;
      estadoAnterior: string;
      estadoNuevo: string;
    }
  ): Promise<void> {
    if (!usuarioAsignadorEmail || !actividad.id) return;

    try {
      const notification: EstadoCambiadoNotification = {
        id: this.generateNotificationId('estado', actividad.id),
        type: 'estado_cambiado',
        title: 'Estado de Actividad Actualizado',
        message: `La actividad de la causa ${actividad.causaRuc} cambió de "${actividad.estadoAnterior}" a "${actividad.estadoNuevo}"`,
        priority: 'medium',
        userId: usuarioAsignadorEmail,
        read: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        metadata: {
          actividadId: actividad.id,
          causaRuc: actividad.causaRuc,
          estadoAnterior: actividad.estadoAnterior,
          estadoNuevo: actividad.estadoNuevo,
          cambiadoPor: cambiadoPorEmail
        }
      };

      eventManager.sendToUser(usuarioAsignadorEmail, notification);
    } catch (error) {
      console.error('Failed to send status change notification:', error);
    }
  }

  async createSystemNotification(
    userEmail: string,
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): Promise<void> {
    if (!userEmail || !title || !message) return;

    try {
      const notification = {
        id: this.generateNotificationId('sistema'),
        type: 'sistema' as const,
        title,
        message,
        priority,
        userId: userEmail,
        read: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {}
      };

      eventManager.sendToUser(userEmail, notification);
    } catch (error) {
      console.error('Failed to create system notification:', error);
    }
  }

  // Temporary implementation - replace with Prisma when available
  async getUserNotifications(
    userEmail: string, 
    filter: NotificationFilter = {}
  ): Promise<Notification[]> {
    // TODO: Implement with actual database queries
    return [];
  }

  async markAsRead(notificationId: string, userEmail: string): Promise<boolean> {
    // TODO: Implement with actual database update
    return true;
  }

  async markAllAsRead(userEmail: string): Promise<boolean> {
    // TODO: Implement with actual database update
    return true;
  }

  async cleanupExpiredNotifications(): Promise<number> {
    // TODO: Implement with actual database cleanup
    return 0;
  }

  async getNotificationStats(userEmail: string) {
    // TODO: Implement with actual database queries
    return {
      total: 0,
      unread: 0,
      byType: {
        actividad_asignada: 0,
        estado_cambiado: 0,
        nueva_causa: 0,
        sistema: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      }
    };
  }

  private generateNotificationId(type: string, relatedId?: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const id = relatedId ? `${relatedId}_${timestamp}` : timestamp.toString();
    return `${type}_${id}_${random}`;
  }
}

export const notificationService = new NotificationService();
