// app/api/test-notification/route.ts - ENDPOINT DE PRUEBA

import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notifications/notificationService';
import { eventManager } from '@/lib/notifications/eventManager';

export async function POST(req: NextRequest) {
  try {
    const { targetEmail, type = 'test' } = await req.json();

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'targetEmail es requerido' },
        { status: 400 }
      );
    }

    let message = '';

    switch (type) {
      case 'actividad':
        await notificationService.notifyActividadAsignada(
          targetEmail,
          'test@sistema.com',
          {
            id: 999,
            causaRuc: '12345678-9',
            tipoActividad: 'Prueba de Notificación',
            fechaInicio: new Date().toISOString()
          }
        );
        message = 'Notificación de actividad asignada enviada';
        break;

      case 'estado':
        await notificationService.notifyEstadoCambiado(
          targetEmail,
          'test@sistema.com',
          {
            id: 999,
            causaRuc: '12345678-9',
            estadoAnterior: 'inicio',
            estadoNuevo: 'en_proceso'
          }
        );
        message = 'Notificación de cambio de estado enviada';
        break;

      default:
        await notificationService.createSystemNotification(
          targetEmail,
          'Notificación de Prueba',
          `Esta es una notificación de prueba enviada a las ${new Date().toLocaleTimeString()}`,
          'medium'
        );
        message = 'Notificación de sistema enviada';
    }

    // Obtener estadísticas de conexiones
    const stats = eventManager.getStats();

    return NextResponse.json({
      success: true,
      message,
      targetEmail,
      connectionStats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en test-notification:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const stats = eventManager.getStats();
  
  return NextResponse.json({
    message: 'Endpoint de prueba de notificaciones',
    instructions: {
      'POST /api/test-notification': {
        body: {
          targetEmail: 'email@example.com',
          type: 'test | actividad | estado'
        },
        description: 'Envía una notificación de prueba al email especificado'
      }
    },
    connectionStats: stats
  });
}
