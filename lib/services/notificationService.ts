import { sendNotification } from '@/app/api/notifications/stream/route';

interface ActividadNotification {
  id: number;
  causa: { ruc: string };
  tipoActividad: { nombre: string };
  usuario: { id: number; nombre: string; email: string };
  usuarioAsignado?: { id: number; nombre: string; email: string };
  estado: string;
  fechaTermino: string;
}

interface UsuarioBasico {
  id: number;
  nombre: string;
  email: string;
}

export class ActividadNotificationService {
  // Notificar cuando se asigna una actividad
  static async notificarActividadAsignada(
    actividad: ActividadNotification,
    usuarioAsignador: UsuarioBasico,
    usuarioAsignado: UsuarioBasico
  ) {
    const notification = {
      type: 'actividad_asignada',
      actividadId: actividad.id,
      mensaje: `${usuarioAsignador.nombre} te asignó una nueva actividad`,
      usuarioOrigen: usuarioAsignador,
      usuarioDestino: usuarioAsignado,
      actividad: {
        id: actividad.id,
        tipoActividad: actividad.tipoActividad.nombre,
        causa: actividad.causa.ruc,
        ruc: actividad.causa.ruc
      },
      timestamp: new Date().toISOString(),
    };

    sendNotification(usuarioAsignado.id.toString(), notification);
    await this.guardarNotificacion(notification);
  }

  // Notificar cambio de estado
  static async notificarCambioEstado(
    actividad: ActividadNotification,
    estadoAnterior: string,
    estadoNuevo: string,
    usuarioQueCambio: UsuarioBasico
  ) {
    const notification = {
      type: 'estado_cambiado',
      actividadId: actividad.id,
      mensaje: `Actividad "${actividad.tipoActividad.nombre}" cambió de estado`,
      usuarioOrigen: usuarioQueCambio,
      actividad: {
        id: actividad.id,
        tipoActividad: actividad.tipoActividad.nombre,
        causa: actividad.causa.ruc,
        ruc: actividad.causa.ruc
      },
      estadoAnterior,
      estadoNuevo,
      timestamp: new Date().toISOString(),
    };

    // Notificar al creador original si es diferente
    if (usuarioQueCambio.id !== actividad.usuario.id) {
      sendNotification(actividad.usuario.id.toString(), notification);
      await this.guardarNotificacion(notification);
    }

    // Si hay un usuario asignado diferente, también notificarle
    if (actividad.usuarioAsignado && 
        actividad.usuarioAsignado.id !== usuarioQueCambio.id && 
        actividad.usuarioAsignado.id !== actividad.usuario.id) {
      sendNotification(actividad.usuarioAsignado.id.toString(), notification);
    }
  }

  // Notificar actividades próximas a vencer
  static async notificarActividadProximaVencer(
    actividad: ActividadNotification,
    usuarioDestino: UsuarioBasico
  ) {
    const notification = {
      type: 'actividad_vencida',
      actividadId: actividad.id,
      mensaje: `Actividad próxima a vencer: ${actividad.tipoActividad.nombre}`,
      usuarioDestino,
      actividad: {
        id: actividad.id,
        tipoActividad: actividad.tipoActividad.nombre,
        causa: actividad.causa.ruc,
        ruc: actividad.causa.ruc
      },
      timestamp: new Date().toISOString(),
    };

    sendNotification(usuarioDestino.id.toString(), notification);
    await this.guardarNotificacion(notification);
  }

  private static async guardarNotificacion(notification: any) {
    try {
      // Aquí implementarías el guardado en tu base de datos
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });
      
      if (!response.ok) {
        console.error('Error guardando notificación:', await response.text());
      }
    } catch (error) {
      console.error('Error guardando notificación:', error);
    }
  }
}