// app/api/notifications/stream/route.ts - CORREGIDO
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Notification, NotificationFromDB } from '@/types/notifications';

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

// ✅ FUNCIÓN HELPER PARA TRANSFORMAR DATOS
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
      return new Response('Unauthorized', { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return new Response('User not found', { status: 404 });
    }

    console.log(`📡 SSE Connection - Usuario: ${usuario.email} (Clerk ID: ${userId})`);

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Store connection
        connections.set(userId, controller);

        // Send initial connection message
        const initialMessage = {
          type: 'ping',
          data: { 
            timestamp: Date.now(), 
            message: `Connected to notifications stream for ${usuario.email}` 
          }
        };
        
        try {
          controller.enqueue(`data: ${JSON.stringify(initialMessage)}\n\n`);
          console.log(`✅ SSE Connected: ${usuario.email}`);
        } catch (error) {
          console.error('Error sending initial message:', error);
        }

        // Send initial stats
        sendInitialStats(userId, usuario.id);

        // Keep-alive ping every 30 seconds
        const pingInterval = setInterval(() => {
          try {
            if (connections.has(userId)) {
              const pingMessage = {
                type: 'ping',
                data: { timestamp: Date.now() }
              };
              controller.enqueue(`data: ${JSON.stringify(pingMessage)}\n\n`);
              console.log(`🏓 Ping sent to ${usuario.email}`);
            } else {
              clearInterval(pingInterval);
            }
          } catch (error) {
            console.error(`❌ Error sending ping to ${usuario.email}:`, error);
            clearInterval(pingInterval);
            connections.delete(userId);
          }
        }, 30000);

        // Cleanup on connection close
        const cleanup = () => {
          clearInterval(pingInterval);
          connections.delete(userId);
          console.log(`🔌 SSE Disconnected: ${usuario.email}`);
        };

        // Handle client disconnection
        req.signal.addEventListener('abort', cleanup);

        // Store cleanup function for potential manual cleanup
        (controller as any)._cleanup = cleanup;
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('❌ Error in SSE stream:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Helper function to send initial stats
async function sendInitialStats(clerkId: string, userId: number) {
  try {
    const [total, unread] = await Promise.all([
      prisma.notificacion.count({
        where: { usuario_id: userId }
      }),
      prisma.notificacion.count({
        where: { 
          usuario_id: userId,
          leida: false 
        }
      })
    ]);

    const statsMessage = {
      type: 'stats',
      data: { total, unread }
    };

    sendToUser(clerkId, statsMessage);
    console.log(`📊 Initial stats sent - Total: ${total}, Unread: ${unread}`);
  } catch (error) {
    console.error('❌ Error sending initial stats:', error);
  }
}

// ✅ FUNCIÓN MEJORADA PARA ENVIAR MENSAJES
export function sendToUser(clerkId: string, message: any) {
  const controller = connections.get(clerkId);
  if (controller) {
    try {
      const messageStr = `data: ${JSON.stringify(message)}\n\n`;
      controller.enqueue(messageStr);
      console.log(`📤 Message sent to user ${clerkId}:`, message.type);
    } catch (error) {
      console.error(`❌ Error sending message to user ${clerkId}:`, error);
      connections.delete(clerkId);
    }
  } else {
    console.log(`⚠️ No SSE connection found for user ${clerkId}`);
  }
}

// ✅ FUNCIÓN MEJORADA PARA ENVIAR NOTIFICACIONES
export function sendNotificationToUser(clerkId: string, notification: Notification) {
  const message = {
    type: 'notification',
    data: notification
  };
  sendToUser(clerkId, message);
}

// Function to send stats update to user
export function sendStatsToUser(clerkId: string, stats: { total: number; unread: number }) {
  const message = {
    type: 'stats',
    data: stats
  };
  sendToUser(clerkId, message);
}

// ✅ FUNCIÓN MEJORADA PARA OBTENER CONEXIONES ACTIVAS
export function getActiveConnections(): string[] {
  return Array.from(connections.keys());
}

// ✅ FUNCIÓN PARA VERIFICAR SI UN USUARIO ESTÁ CONECTADO
export function isUserConnected(clerkId: string): boolean {
  return connections.has(clerkId);
}

// Cleanup function for graceful shutdown
export function cleanup() {
  console.log(`🧹 Cleaning up ${connections.size} SSE connections`);
  for (const [clerkId, controller] of connections.entries()) {
    try {
      if ((controller as any)._cleanup) {
        (controller as any)._cleanup();
      }
      controller.close();
    } catch (error) {
      console.error(`❌ Error cleaning up connection for ${clerkId}:`, error);
    }
  }
  connections.clear();
}