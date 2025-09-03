import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

interface NotificacionRequest {
  tipo: 'asignacion_recibida' | 'cambio_estado' | 'actividad_completada' | 'actividad_vencida';
  actividadId: number;
  usuarioDestinoId?: number;
  usuarioOrigenId?: number;
  estadoAnterior?: string;
  estadoNuevo?: string;
  mensaje?: string;
}

interface NotificacionResponse {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  fechaCreacion: string;
  actividadId: number;
  usuarioOrigen?: any;
  usuarioDestino?: any;
  estadoAnterior?: string;
  estadoNuevo?: string;
  esUrgente: boolean;
  leida: boolean;
  metadata?: any;
}

// GET - Obtener notificaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const tipo = searchParams.get('tipo');
    const soloNoLeidas = searchParams.get('solo_no_leidas') === 'true';

    // En un sistema real, aquí consultarías la base de datos
    // Por ahora, devolvemos notificaciones simuladas
    const notificacionesEjemplo: NotificacionResponse[] = [
      {
        id: `notif-${Date.now()}-1`,
        tipo: 'asignacion_recibida',
        titulo: '🔔 Nueva Actividad Asignada',
        mensaje: 'Ana García te ha asignado "Revisión de Documentos" en la causa RUC-123456',
        fechaCreacion: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min atrás
        actividadId: 1001,
        usuarioOrigen: {
          id: 999,
          nombre: 'Ana García',
          email: 'ana.garcia@fiscal.cl'
        },
        esUrgente: false,
        leida: false,
        metadata: {
          ruc: 'RUC-123456',
          tipoActividad: 'Revisión de Documentos',
          fechaVencimiento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: `notif-${Date.now()}-2`,
        tipo: 'actividad_completada',
        titulo: '✅ Actividad Completada',
        mensaje: 'Carlos López completó "Análisis Forense" que le asignaste',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        actividadId: 1002,
        usuarioOrigen: {
          id: 888,
          nombre: 'Carlos López',
          email: 'carlos.lopez@fiscal.cl'
        },
        estadoAnterior: 'en_proceso',
        estadoNuevo: 'terminado',
        esUrgente: true,
        leida: false,
        metadata: {
          ruc: 'RUC-789012',
          tipoActividad: 'Análisis Forense',
          fechaVencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
    ];

    // Aplicar filtros
    let notificacionesFiltradas = notificacionesEjemplo;
    
    if (tipo) {
      notificacionesFiltradas = notificacionesFiltradas.filter(n => n.tipo === tipo);
    }
    
    if (soloNoLeidas) {
      notificacionesFiltradas = notificacionesFiltradas.filter(n => !n.leida);
    }

    // Aplicar paginación
    const notificacionesPaginadas = notificacionesFiltradas.slice(offset, offset + limit);

    return NextResponse.json({
      data: notificacionesPaginadas,
      metadata: {
        total: notificacionesFiltradas.length,
        limit,
        offset,
        hasMore: offset + limit < notificacionesFiltradas.length
      }
    });

  } catch (error) {
    console.error('Error en GET /api/notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva notificación
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: NotificacionRequest = await request.json();
    
    // Validaciones
    if (!body.tipo || !body.actividadId) {
      return NextResponse.json(
        { error: 'Tipo y actividadId son requeridos' },
        { status: 400 }
      );
    }

    // En un sistema real, aquí insertarías en la base de datos
    const nuevaNotificacion: NotificacionResponse = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tipo: body.tipo,
      titulo: generarTitulo(body.tipo),
      mensaje: body.mensaje || generarMensaje(body.tipo, body),
      fechaCreacion: new Date().toISOString(),
      actividadId: body.actividadId,
      usuarioOrigen: body.usuarioOrigenId ? await obtenerUsuario(body.usuarioOrigenId) : undefined,
      usuarioDestino: body.usuarioDestinoId ? await obtenerUsuario(body.usuarioDestinoId) : undefined,
      estadoAnterior: body.estadoAnterior,
      estadoNuevo: body.estadoNuevo,
      esUrgente: determinarUrgencia(body.tipo, body),
      leida: false,
      metadata: await obtenerMetadataActividad(body.actividadId)
    };

    // En un sistema real, aquí enviarías la notificación via WebSocket, SSE, o push notification
    console.log('Nueva notificación creada:', nuevaNotificacion);

    return NextResponse.json({
      data: nuevaNotificacion,
      message: 'Notificación creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Marcar notificación como leída
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const notificacionId = searchParams.get('id');
    const body = await request.json();

    if (!notificacionId) {
      return NextResponse.json(
        { error: 'ID de notificación es requerido' },
        { status: 400 }
      );
    }

    // En un sistema real, aquí actualizarías la base de datos
    console.log(`Marcando notificación ${notificacionId} como leída:`, body);

    return NextResponse.json({
      message: 'Notificación actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en PUT /api/notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar notificación
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const notificacionId = searchParams.get('id');

    if (!notificacionId) {
      return NextResponse.json(
        { error: 'ID de notificación es requerido' },
        { status: 400 }
      );
    }

    // En un sistema real, aquí eliminarías de la base de datos
    console.log(`Eliminando notificación ${notificacionId}`);

    return NextResponse.json({
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function generarTitulo(tipo: string): string {
  switch (tipo) {
    case 'asignacion_recibida':
      return '🔔 Nueva Actividad Asignada';
    case 'cambio_estado':
      return '🔄 Cambio de Estado';
    case 'actividad_completada':
      return '✅ Actividad Completada';
    case 'actividad_vencida':
      return '⚠️ Actividad Vencida';
    default:
      return '📢 Notificación';
  }
}

function generarMensaje(tipo: string, body: NotificacionRequest): string {
  switch (tipo) {
    case 'asignacion_recibida':
      return `Se te ha asignado una nueva actividad (ID: ${body.actividadId})`;
    case 'cambio_estado':
      return `Cambio de estado: ${body.estadoAnterior} → ${body.estadoNuevo}`;
    case 'actividad_completada':
      return `Se completó la actividad ID: ${body.actividadId}`;
    case 'actividad_vencida':
      return `La actividad ID: ${body.actividadId} está vencida`;
    default:
      return 'Nueva notificación disponible';
  }
}

function determinarUrgencia(tipo: string, body: NotificacionRequest): boolean {
  switch (tipo) {
    case 'actividad_vencida':
      return true;
    case 'actividad_completada':
      return true;
    case 'asignacion_recibida':
      return false;
    case 'cambio_estado':
      return body.estadoNuevo === 'terminado';
    default:
      return false;
  }
}

async function obtenerUsuario(userId: number) {
  // En un sistema real, consultarías la base de datos
  const usuariosEjemplo = {
    999: { id: 999, nombre: 'Ana García', email: 'ana.garcia@fiscal.cl' },
    888: { id: 888, nombre: 'Carlos López', email: 'carlos.lopez@fiscal.cl' },
    777: { id: 777, nombre: 'María Rodríguez', email: 'maria.rodriguez@fiscal.cl' }
  };
  
  return usuariosEjemplo[userId as keyof typeof usuariosEjemplo] || null;
}

async function obtenerMetadataActividad(actividadId: number) {
  // En un sistema real, consultarías la actividad en la base de datos
  return {
    ruc: `RUC-${Math.floor(Math.random() * 999999)}`,
    tipoActividad: 'Actividad de Ejemplo',
    fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
}