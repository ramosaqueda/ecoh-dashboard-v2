// /lib/notifications/server/notificationGenerator.ts
import { prisma } from '@/lib/prisma';

// Interfaces para las notificaciones del servidor
interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'actividad_nueva' | 'actividad_actualizada' | 'causa_nueva' | 'causa_actualizada' | 'sistema';
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  persistent: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

interface ActividadNotificationData extends NotificationData {
  type: 'actividad_nueva' | 'actividad_actualizada';
  actividadId: number;
  causaRuc: string;
  tipoActividad: string;
  actionUrl: string;
}

// Función para generar notificación de nueva actividad
export async function generarNotificacionNuevaActividad(actividadId: number) {
  try {
    // Obtener datos completos de la actividad
    const actividad = await prisma.actividad.findUnique({
      where: { id: actividadId },
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true            
          }
        },
        tipoActividad: {
          select: {
            id: true,
            nombre: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            clerk_id: true
          }
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
            clerk_id: true
          }
        }
      }
    });

    if (!actividad) {
      console.error(`Actividad ${actividadId} no encontrada para generar notificación`);
      return null;
    }

    const notification: ActividadNotificationData = {
      id: `actividad-nueva-${actividadId}-${Date.now()}`,
      title: 'Nueva Actividad Asignada',
      message: `Se te ha asignado una nueva actividad: "${actividad.tipoActividad.nombre}" para la causa ${actividad.causa.ruc}`,
      type: 'actividad_nueva',
      timestamp: new Date(),
      read: false,
      dismissed: false,
      persistent: true,
      autoHide: false,
      actividadId: actividad.id,
      causaRuc: actividad.causa.ruc ?? '',
      tipoActividad: actividad.tipoActividad.nombre,
      actionUrl: `/dashboard/actividades?highlight=${actividad.id}`
    };

    return {
      notification,
      targetUserId: actividad.usuarioAsignado?.clerk_id || null,
      createdByUserId: actividad.usuario?.clerk_id || null
    };

  } catch (error) {
    console.error('Error generando notificación de nueva actividad:', error);
    return null;
  }
}

// Función para generar notificación de actividad actualizada
export async function generarNotificacionActividadActualizada(actividadId: number, cambios: string[] = []) {
  try {
    const actividad = await prisma.actividad.findUnique({
      where: { id: actividadId },
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true // Asegúrate de que este campo existe en tu modelo
          }
        },
        tipoActividad: {
          select: {
            id: true,
            nombre: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            clerk_id: true
          }
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
            clerk_id: true
          }
        }
      }
    });

    if (!actividad) {
      console.error(`Actividad ${actividadId} no encontrada para generar notificación de actualización`);
      return null;
    }

    const cambiosTexto = cambios.length > 0 ? ` (${cambios.join(', ')})` : '';

    const notification: ActividadNotificationData = {
      id: `actividad-actualizada-${actividadId}-${Date.now()}`,
      title: 'Actividad Actualizada',
      message: `La actividad "${actividad.tipoActividad.nombre}" de la causa ${actividad.causa.ruc} ha sido actualizada${cambiosTexto}`,
      type: 'actividad_actualizada',
      timestamp: new Date(),
      read: false,
      dismissed: false,
      persistent: true,
      autoHide: false,
      actividadId: actividad.id,
      causaRuc: actividad.causa.ruc ?? '',
      tipoActividad: actividad.tipoActividad.nombre,
      actionUrl: `/dashboard/actividades?highlight=${actividad.id}`
    };

    return {
      notification,
      targetUserId: actividad.usuarioAsignado?.clerk_id || null,
      createdByUserId: actividad.usuario?.clerk_id || null
    };

  } catch (error) {
    console.error('Error generando notificación de actividad actualizada:', error);
    return null;
  }
}

// Función utilitaria para detectar cambios significativos
export function detectarCambiosSignificativos(datosAnteriores: any, datosNuevos: any): string[] {
  const cambios: string[] = [];

  if (datosAnteriores.estado !== datosNuevos.estado) {
    cambios.push('Estado');
  }

  if (datosAnteriores.usuario_asignado_id !== datosNuevos.usuario_asignado_id) {
    cambios.push('Usuario asignado');
  }

  if (datosAnteriores.fechaInicio?.getTime() !== datosNuevos.fechaInicio?.getTime()) {
    cambios.push('Fecha de inicio');
  }

  if (datosAnteriores.fechaTermino?.getTime() !== datosNuevos.fechaTermino?.getTime()) {
    cambios.push('Fecha de término');
  }

  if (datosAnteriores.observacion !== datosNuevos.observacion) {
    cambios.push('Observaciones');
  }

  return cambios;
}
