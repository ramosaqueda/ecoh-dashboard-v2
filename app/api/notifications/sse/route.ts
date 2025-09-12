// app/api/notifications/sse/route.ts - VERSIÓN LIMPIA Y ESTANDARIZADA

import { NextRequest } from 'next/server';
import { eventManager } from '@/lib/notifications/eventManager';
import { notificationService } from '@/lib/notifications/notificationService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('userEmail');
  
  if (!userEmail) {
    return new Response('Bad Request: userEmail parameter required', { status: 400 });
  }

  const clientId = generateClientId(userEmail);

  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  });

  const stream = new ReadableStream({
    start(controller) {
      eventManager.addClient(clientId, userEmail, controller);
      
      // Load and send pending notifications
      notificationService.getUserNotifications(userEmail, { unreadOnly: true })
        .then(notifications => {
          notifications.forEach(notification => {
            eventManager.sendToUser(userEmail, notification);
          });
        })
        .catch(() => {
          // Silently handle errors - client connection is more important
        });
    },
    
    cancel() {
      eventManager.removeClient(clientId);
    }
  });

  return new Response(stream, { headers: responseHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return Response.json({ error: 'Unauthorized: x-user-email header required' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'stats':
        return await handleStats(userEmail);

      case 'mark_read':
        return await handleMarkRead(body.notificationId, userEmail);

      case 'mark_all_read':
        return await handleMarkAllRead(userEmail);

      case 'create_test_notification':
        return await handleCreateTestNotification(userEmail);

      case 'heartbeat':
        eventManager.sendHeartbeat(userEmail);
        return Response.json({ success: true, message: 'Heartbeat sent' });

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function generateClientId(userEmail: string): string {
  return `client_${userEmail}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

async function handleStats(userEmail: string) {
  const serverStats = eventManager.getStats();
  const userStats = await notificationService.getNotificationStats(userEmail);
  return Response.json({ server: serverStats, user: userStats });
}

async function handleMarkRead(notificationId: string, userEmail: string) {
  if (!notificationId) {
    return Response.json({ error: 'notificationId required' }, { status: 400 });
  }
  
  const success = await notificationService.markAsRead(notificationId, userEmail);
  return Response.json({ success });
}

async function handleMarkAllRead(userEmail: string) {
  const success = await notificationService.markAllAsRead(userEmail);
  return Response.json({ success });
}

async function handleCreateTestNotification(userEmail: string) {
  await notificationService.createSystemNotification(
    userEmail,
    'Notificación de Prueba',
    'Esta es una notificación de prueba del sistema de tiempo real.',
    'medium'
  );
  return Response.json({ success: true, message: 'Test notification created' });
}
