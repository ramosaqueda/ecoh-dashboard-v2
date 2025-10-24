// /app/api/notifications/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendNotificationToUser } from '@/lib/notifications/server/sseManager';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Solo en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { message: 'Endpoint solo disponible en desarrollo' },
        { status: 403 }
      );
    }

    const { actividadId, tipo = 'nueva' } = await req.json();

    // Crear notificación simple para testing
    const notification = {
      id: `test-${Date.now()}`,
      title: tipo === 'nueva' ? 'Nueva Actividad Asignada' : 'Actividad Actualizada',
      message: `Se te ha asignado la actividad #${actividadId || 1}. Haz clic en "Ver" para revisarla.`,
      type: 'actividad_nueva',
      timestamp: new Date(),
      read: false,
      dismissed: false,
      persistent: true,
      autoHide: false,
      actividadId: actividadId || 1,
      causaRuc: 'TEST-001',
      tipoActividad: 'Actividad de Prueba',
      actionUrl: ` /dashboard/todo?highlight=${actividadId || 1}`
    };

    // Intentar enviar vía SSE
    const sent = sendNotificationToUser(userId, notification);

    return NextResponse.json({
      success: true,
      message: sent 
        ? `Notificación ${tipo} enviada correctamente para actividad ${actividadId || 1}`
        : `Notificación preparada (usuario no conectado al SSE)`,
      userId,
      actividadId: actividadId || 1,
      tipo,
      sent,
      notification
    });

  } catch (error) {
    console.error('Error en POST /api/notifications/test:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error enviando notificación de prueba',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
