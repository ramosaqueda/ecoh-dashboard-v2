// /lib/notifications/server/notificationSender.ts

import { sendNotificationToUser } from './sseManager';

// Función para enviar notificación vía SSE
export async function enviarNotificacion(targetUserId: string, notification: any) {
  try {
    // Intentar enviar vía SSE directamente
    const sent = sendNotificationToUser(targetUserId, notification);
    
    if (sent) {
      console.log(`✅ Notificación enviada vía SSE a usuario ${targetUserId}:`, notification.title);
      return true;
    } else {
      console.log(`⚠️ Usuario ${targetUserId} no conectado al SSE - notificación guardada para cuando se conecte`);
      // La notificación se mostrará cuando el usuario se conecte al SSE
      return true;
    }

  } catch (error) {
    console.error('Error enviando notificación:', error);
    return false;
  }
}

// Función simplificada para enviar notificaciones
export async function notificarActividad(tipo: 'nueva' | 'actualizada', actividadId: number, targetUserId?: string) {
  try {
    console.log(`🔔 Iniciando notificación ${tipo} para actividad ${actividadId} → usuario ${targetUserId}`);
    
    // Importar el generador de notificaciones
    const { generarNotificacionNuevaActividad, generarNotificacionActividadActualizada } = 
      await import('./notificationGenerator');

    let resultado;
    
    if (tipo === 'nueva') {
      resultado = await generarNotificacionNuevaActividad(actividadId);
    } else {
      resultado = await generarNotificacionActividadActualizada(actividadId);
    }

    if (!resultado) {
      console.error(`❌ No se pudo generar notificación ${tipo} para actividad ${actividadId}`);
      return false;
    }

    const { notification, targetUserId: generatedTargetUserId } = resultado;
    const finalTargetUserId = targetUserId || generatedTargetUserId;

    if (!finalTargetUserId) {
      console.error(`❌ No se encontró usuario objetivo para notificación de actividad ${actividadId}`);
      return false;
    }

    console.log(`📦 Notificación generada:`, {
      id: notification.id,
      title: notification.title,
      targetUser: finalTargetUserId,
      actividadId
    });

    // Enviar la notificación
    const result = await enviarNotificacion(finalTargetUserId, notification);
    
    if (result) {
      console.log(`✅ Proceso de notificación ${tipo} completado exitosamente`);
    } else {
      console.log(`⚠️ Proceso de notificación ${tipo} completado con advertencias`);
    }
    
    return result;

  } catch (error) {
    console.error(`❌ Error notificando actividad ${tipo}:`, error);
    return false;
  }
}
