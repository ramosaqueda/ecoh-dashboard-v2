import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Interfaces para tipado fuerte

interface EventoTiempoReal {
  tipo: 'actividad_asignada' | 'estado_cambiado' | 'actividad_completada' | 'recordatorio_vencimiento';
  actividadId: number;
  usuarioAsignadorId?: number;
  usuarioAsignadoId?: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
  fechaVencimiento?: string;
  metadata?: {
    ruc: string;
    tipoActividad: string;
    observacion?: string;
  };
}

interface NotificacionGenerada {
  id: string;
  tipo: 'asignacion_recibida' | 'cambio_estado' | 'actividad_completada' | 'actividad_vencida';
  titulo: string;
  mensaje: string;
  fechaCreacion: string;
  actividadId: number;
  usuarioOrigenId?: number;
  usuarioDestinoId?: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
  esUrgente: boolean;
  leida: boolean;
  metadata?: {
    ruc: string;
    tipoActividad: string;
    observacion?: string;
  };
}

// POST - Procesar evento en tiempo real
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const evento: EventoTiempoReal = await request.json();
    
    // Validaciones
    if (!evento.tipo || !evento.actividadId) {
      return NextResponse.json(
        { error: 'Tipo de evento y actividadId son requeridos' },
        { status: 400 }
      );
    }

    const notificacionesGeneradas: NotificacionGenerada[] = [];

    switch (evento.tipo) {
      case 'actividad_asignada':
        if (evento.usuarioAsignadoId) {
          const notificacionAsignado = crearNotificacionAsignacion(evento);
          notificacionesGeneradas.push(notificacionAsignado);
        }
        break;

      case 'estado_cambiado':
        if (evento.usuarioAsignadorId && evento.usuarioAsignadorId !== parseInt(userId)) {
          const notificacionCambio = crearNotificacionCambioEstado(evento);
          notificacionesGeneradas.push(notificacionCambio);
        }
        break;

      case 'actividad_completada':
        if (evento.usuarioAsignadorId && evento.usuarioAsignadorId !== parseInt(userId)) {
          const notificacionCompletada = crearNotificacionCompletada(evento);
          notificacionesGeneradas.push(notificacionCompletada);
        }
        break;

      case 'recordatorio_vencimiento':
        if (evento.usuarioAsignadoId) {
          const notificacionVencimiento = crearNotificacionVencimiento(evento);
          notificacionesGeneradas.push(notificacionVencimiento);
        }
        break;
    }

    console.log('📢 Eventos procesados:', {
      tipo: evento.tipo,
      actividadId: evento.actividadId,
      notificacionesGeneradas: notificacionesGeneradas.length
    });

    // Procesar notificaciones generadas
    for (const notificacion of notificacionesGeneradas) {
      await procesarNotificacion(notificacion);
    }

    return NextResponse.json({
      success: true,
      data: notificacionesGeneradas,
      message: `Se procesaron ${notificacionesGeneradas.length} notificaciones`,
      evento: evento.tipo
    });

  } catch (error) {
    console.error('❌ Error en POST /api/notificaciones/eventos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Funciones auxiliares para crear notificaciones - Sin dependencias externas
function crearNotificacionAsignacion(evento: EventoTiempoReal): NotificacionGenerada {
  return {
    id: `asignacion-${evento.actividadId}-${Date.now()}`,
    tipo: 'asignacion_recibida',
    titulo: '🔔 Nueva Actividad Asignada',
    mensaje: `Se te ha asignado "${evento.metadata?.tipoActividad || 'Actividad'}" para la causa ${evento.metadata?.ruc}\n\n**Detalle de la actividad:** ${evento.metadata?.observacion || 'Sin observaciones adicionales'}`,
    fechaCreacion: new Date().toISOString(),
    actividadId: evento.actividadId,
    usuarioOrigenId: evento.usuarioAsignadorId,
    usuarioDestinoId: evento.usuarioAsignadoId,
    esUrgente: calcularUrgenciaPorFecha(evento.fechaVencimiento),
    leida: false,
    metadata: evento.metadata
  };
}

function crearNotificacionCambioEstado(evento: EventoTiempoReal): NotificacionGenerada {
  return {
    id: `cambio-${evento.actividadId}-${Date.now()}`,
    tipo: 'cambio_estado',
    titulo: '🔄 Cambio de Estado',
    mensaje: `El estado de "${evento.metadata?.tipoActividad || 'la actividad'}" cambió de "${evento.estadoAnterior}" a "${evento.estadoNuevo}"`,
    fechaCreacion: new Date().toISOString(),
    actividadId: evento.actividadId,
    usuarioOrigenId: evento.usuarioAsignadoId,
    usuarioDestinoId: evento.usuarioAsignadorId,
    estadoAnterior: evento.estadoAnterior,
    estadoNuevo: evento.estadoNuevo,
    esUrgente: evento.estadoNuevo === 'terminado',
    leida: false,
    metadata: evento.metadata
  };
}

function crearNotificacionCompletada(evento: EventoTiempoReal): NotificacionGenerada {
  return {
    id: `completada-${evento.actividadId}-${Date.now()}`,
    tipo: 'actividad_completada',
    titulo: '✅ Actividad Completada',
    mensaje: `La actividad "${evento.metadata?.tipoActividad || 'actividad'}" en la causa ${evento.metadata?.ruc} ha sido completada`,
    fechaCreacion: new Date().toISOString(),
    actividadId: evento.actividadId,
    usuarioOrigenId: evento.usuarioAsignadoId,
    usuarioDestinoId: evento.usuarioAsignadorId,
    estadoAnterior: evento.estadoAnterior,
    estadoNuevo: 'terminado',
    esUrgente: true,
    leida: false,
    metadata: evento.metadata
  };
}

function crearNotificacionVencimiento(evento: EventoTiempoReal): NotificacionGenerada {
  return {
    id: `vencimiento-${evento.actividadId}-${Date.now()}`,
    tipo: 'actividad_vencida',
    titulo: '⚠️ Actividad Vencida',
    mensaje: `La actividad "${evento.metadata?.tipoActividad || 'actividad'}" en causa ${evento.metadata?.ruc} está vencida`,
    fechaCreacion: new Date().toISOString(),
    actividadId: evento.actividadId,
    usuarioDestinoId: evento.usuarioAsignadoId,
    esUrgente: true,
    leida: false,
    metadata: evento.metadata
  };
}

// Funciones de utilidad
function calcularUrgenciaPorFecha(fechaVencimiento?: string): boolean {
  if (!fechaVencimiento) return false;
  
  const fechaVence = new Date(fechaVencimiento);
  const ahora = new Date();
  const diffDays = Math.ceil((fechaVence.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
  
  return diffDays <= 3; // Urgente si vence en 3 días o menos
}

async function procesarNotificacion(notificacion: NotificacionGenerada): Promise<boolean> {
  try {
    // Aquí se implementaría la lógica real de procesamiento:
    // 1. Guardar en base de datos
    // 2. Enviar via WebSocket si el usuario está conectado
    // 3. Programar push notification si aplica
    // 4. Enviar email para notificaciones urgentes
    
    console.log('✅ Notificación procesada:', {
      id: notificacion.id,
      tipo: notificacion.tipo,
      destinatario: notificacion.usuarioDestinoId,
      urgente: notificacion.esUrgente
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error procesando notificación:', error);
    return false;
  }
}