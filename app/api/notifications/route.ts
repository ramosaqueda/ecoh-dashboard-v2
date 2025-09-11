// app/api/notifications/route.ts - CORREGIDO
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Notification, NotificationFromDB } from '@/types/notifications';

// ✅ FUNCIÓN HELPER PARA TRANSFORMAR DATOS DE PRISMA A FRONTEND
function transformNotification(dbNotification: NotificationFromDB): Notification {
  return {
    id: dbNotification.id,
    userId: dbNotification.usuario_id,
    title: dbNotification.titulo,
    message: dbNotification.mensaje || '',
    type: dbNotification.tipo as 'activity_assigned' | 'activity_updated' | 'activity_pending' | 'system',
    read: dbNotification.leida,
    createdAt: dbNotification.createdAt.toISOString(),
    activityId: dbNotification.actividad_id || undefined,
    metadata: dbNotification.metadata ? JSON.parse(dbNotification.metadata) : undefined
  };
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    console.log(`📋 GET /api/notifications - Usuario: ${usuario.email} (ID: ${usuario.id})`);

    // Get notifications for the user
    const [dbNotifications, total] = await Promise.all([
      prisma.notificacion.findMany({
        where: { usuario_id: usuario.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }) as Promise<NotificationFromDB[]>,
      prisma.notificacion.count({
        where: { usuario_id: usuario.id }
      })
    ]);

    // Get unread count
    const unreadCount = await prisma.notificacion.count({
      where: { 
        usuario_id: usuario.id,
        leida: false 
      }
    });

    // ✅ TRANSFORMAR DATOS DE PRISMA A FORMATO FRONTEND
    const notifications = dbNotifications.map(transformNotification);

    console.log(`📊 Notificaciones encontradas: ${notifications.length}, No leídas: ${unreadCount}`);

    return NextResponse.json({
      notifications,
      stats: {
        total,
        unread: unreadCount
      },
      metadata: {
        page,
        limit,
        hasMore: skip + notifications.length < total
      }
    });

  } catch (error) {
    console.error('❌ Error en GET /api/notifications:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { notificationId, markAllAsRead } = await req.json();

    console.log(`📝 PATCH /api/notifications - Usuario: ${usuario.email}, Acción: ${markAllAsRead ? 'marcar todas' : `marcar ID ${notificationId}`}`);

    if (markAllAsRead) {
      // Mark all notifications as read
      const result = await prisma.notificacion.updateMany({
        where: { 
          usuario_id: usuario.id,
          leida: false 
        },
        data: { 
          leida: true,
          fecha_lectura: new Date()
        }
      });

      console.log(`✅ Marcadas ${result.count} notificaciones como leídas`);
      return NextResponse.json({ message: 'Todas las notificaciones marcadas como leídas' });
    }

    if (notificationId) {
      // Mark specific notification as read - ✅ VALIDAR QUE ES NÚMERO
      const numericId = typeof notificationId === 'string' ? parseInt(notificationId) : notificationId;
      
      if (isNaN(numericId)) {
        return NextResponse.json(
          { message: 'ID de notificación inválido' },
          { status: 400 }
        );
      }

      await prisma.notificacion.update({
        where: { 
          id: numericId,
          usuario_id: usuario.id 
        },
        data: { 
          leida: true,
          fecha_lectura: new Date()
        }
      });

      console.log(`✅ Notificación ${numericId} marcada como leída`);
      return NextResponse.json({ message: 'Notificación marcada como leída' });
    }

    return NextResponse.json(
      { message: 'Parámetros inválidos' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error en PATCH /api/notifications:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { notificationId } = await req.json();

    // ✅ VALIDAR QUE ES NÚMERO
    const numericId = typeof notificationId === 'string' ? parseInt(notificationId) : notificationId;
    
    if (isNaN(numericId)) {
      return NextResponse.json(
        { message: 'ID de notificación inválido' },
        { status: 400 }
      );
    }

    console.log(`🗑️ DELETE /api/notifications - Usuario: ${usuario.email}, ID: ${numericId}`);

    await prisma.notificacion.delete({
      where: { 
        id: numericId,
        usuario_id: usuario.id 
      }
    });

    console.log(`✅ Notificación ${numericId} eliminada`);
    return NextResponse.json({ message: 'Notificación eliminada' });

  } catch (error) {
    console.error('❌ Error en DELETE /api/notifications:', error);
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}