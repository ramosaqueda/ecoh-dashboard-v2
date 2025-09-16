// ==========================================
// ARCHIVO: /lib/notifications/notificationTriggers.ts
// ==========================================

import { NotificationCreator } from './notificationCreator';

// Helper functions para integrar con los endpoints existentes
export class NotificationTriggers {
  
  // Llamar cuando se crea una nueva actividad
  static async onActivityCreated(
    activityId: number, 
    assignedUserId: number | null, 
    createdByUserId?: number
  ) {
    console.log(`🔔 Trigger: Nueva actividad ${activityId} creada`);
    
    if (assignedUserId && createdByUserId && assignedUserId !== createdByUserId) {
      console.log(`📧 Creando notificación para usuario ${assignedUserId}`);
      
      await NotificationCreator.createActivityAssignedNotification(
        activityId, 
        assignedUserId, 
        createdByUserId
      );
    } else {
      console.log(`⏭️ No se crea notificación: ${!assignedUserId ? 'sin usuario asignado' : 'auto-asignación'}`);
    }
  }

  // Llamar cuando se actualiza una actividad
  static async onActivityUpdated(
    activityId: number,
    assignedUserId: number | null,
    updatedByUserId: number | undefined,
    oldData: any,
    newData: any
  ) {
    console.log(`🔔 Trigger: Actividad ${activityId} actualizada`);
    
    if (!assignedUserId || !updatedByUserId || assignedUserId === updatedByUserId) {
      console.log(`⏭️ No se crea notificación de actualización: ${!assignedUserId ? 'sin asignado' : 'auto-actualización'}`);
      return;
    }

    // Detectar cambios significativos
    const changes: string[] = [];
    
    if (oldData.estado !== newData.estado) {
      changes.push(`estado cambió de "${oldData.estado}" a "${newData.estado}"`);
    }
    
    if (oldData.fechaTermino !== newData.fechaTermino) {
      const oldDate = new Date(oldData.fechaTermino).toLocaleDateString();
      const newDate = new Date(newData.fechaTermino).toLocaleDateString();
      changes.push(`fecha de término cambió de ${oldDate} a ${newDate}`);
    }
    
    if (oldData.observacion !== newData.observacion) {
      changes.push('observaciones actualizadas');
    }

    if (oldData.glosa_cierre !== newData.glosa_cierre && newData.glosa_cierre) {
      changes.push('glosa de cierre agregada');
    }
    
    // Caso especial: cambio de asignación
    if (oldData.usuario_asignado_id !== newData.usuario_asignado_id) {
      if (oldData.usuario_asignado_id === null && newData.usuario_asignado_id) {
        // Nueva asignación
        console.log(`📧 Nueva asignación: actividad ${activityId} asignada a usuario ${newData.usuario_asignado_id}`);
        
        await NotificationCreator.createActivityAssignedNotification(
          activityId, 
          newData.usuario_asignado_id, 
          updatedByUserId
        );
        return;
        
      } else if (oldData.usuario_asignado_id && newData.usuario_asignado_id) {
        changes.push(`reasignada de usuario ${oldData.usuario_asignado_id} a usuario ${newData.usuario_asignado_id}`);
        
        // Notificar al nuevo usuario asignado
        await NotificationCreator.createActivityAssignedNotification(
          activityId, 
          newData.usuario_asignado_id, 
          updatedByUserId
        );
        
      } else if (oldData.usuario_asignado_id && !newData.usuario_asignado_id) {
        changes.push('asignación removida');
      }
    }

    // Si hay cambios significativos, crear notificación de actualización
    if (changes.length > 0) {
      console.log(`📧 Cambios detectados en actividad ${activityId}:`, changes);
      
      await NotificationCreator.createActivityUpdatedNotification(
        activityId,
        assignedUserId,
        updatedByUserId,
        changes
      );
    } else {
      console.log(`⏭️ No hay cambios significativos en actividad ${activityId}`);
    }
  }

  // Llamar cuando se elimina una actividad
  static async onActivityDeleted(activityId: number) {
    console.log(`🔔 Trigger: Actividad ${activityId} eliminada`);
    
    const cleanedCount = await NotificationCreator.cleanupNotificationsForDeletedActivity(activityId);
    
    console.log(`🧹 Limpiadas ${cleanedCount} notificaciones para actividad eliminada ${activityId}`);
  }

  // Método adicional para forzar verificación de actividades vencidas
  static async checkOverdueActivities() {
    console.log(`🔔 Trigger: Verificando actividades vencidas...`);
    
    const notifications = await NotificationCreator.createOverdueActivityNotifications();
    
    console.log(`⚠️ Creadas ${notifications.length} notificaciones de actividades vencidas`);
    
    return notifications;
  }

  // Método para limpiar notificaciones expiradas de todos los usuarios
  static async cleanupExpiredNotifications() {
    console.log(`🔔 Trigger: Limpiando notificaciones expiradas...`);
    
    try {
      // Este método requeriría permisos de administrador
      const result = await fetch('/api/admin/notifications/cleanup', {
        method: 'POST'
      });
      
      if (result.ok) {
        const data = await result.json();
        console.log(`🧹 Limpieza global completada: ${data.deletedCount} notificaciones eliminadas`);
        return data.deletedCount;
      }
    } catch (error) {
      console.error('Error en limpieza global:', error);
    }
    
    return 0;
  }

  // Método de debug para ver el estado de notificaciones
  static async debugActivityNotifications(activityId: number) {
    console.log(`🔍 Debug: Notificaciones para actividad ${activityId}`);
    
    try {
      const response = await fetch(`/api/notifications?actividadId=${activityId}`);
      if (response.ok) {
        const data = await response.json();
        console.table(data.notifications);
        return data.notifications;
      }
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
    }
    
    return [];
  }
}