import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Map para mantener las conexiones activas
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  // 🔧 CORREGIDO: Usar Clerk auth en lugar de NextAuth
  const { userId: clerkUserId } = auth();
  
  if (!clerkUserId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const userDbId = searchParams.get('userId'); // Este es el ID de la base de datos

  if (!userDbId) {
    return new Response('UserId required', { status: 400 });
  }

  // 🔧 VERIFICAR: Que el usuario existe y el clerkId coincide
  const user = await prisma.usuario.findUnique({
    where: { 
      id: parseInt(userDbId),
      clerkId: clerkUserId // Verificar que es el usuario correcto
    }
  });

  if (!user) {
    return new Response('User not found or unauthorized', { status: 403 });
  }

  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      clients.set(userDbId, controller);

      // Enviar evento inicial
      const data = `data: ${JSON.stringify({ 
        type: 'connected', 
        message: `Conectado al sistema de notificaciones para ${user.nombre}`,
        timestamp: new Date().toISOString()
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    },
    cancel() {
      clients.delete(userDbId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Función helper para enviar notificaciones - SIN CAMBIOS
export function sendNotification(userId: string, notification: any) {
  const controller = clients.get(userId);
  if (controller) {
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    try {
      controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      console.error('Error sending notification:', error);
      clients.delete(userId);
    }
  }
}