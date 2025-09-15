// /app/api/notifications/sse/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { addConnection, removeConnection } from '@/lib/notifications/server/sseManager';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Verificar que el usuario existe en la BD
    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return new Response('User not found', { status: 404 });
    }

    // Crear stream SSE
    const stream = new ReadableStream({
      start(controller) {
        // Registrar la conexión en el manager
        addConnection(userId, controller);

        // Enviar evento inicial de conexión
        controller.enqueue(`data: ${JSON.stringify({
          type: 'connection',
          message: 'Conexión SSE establecida',
          timestamp: new Date().toISOString()
        })}\n\n`);

        // Keepalive cada 30 segundos
        const keepAlive = setInterval(() => {
          try {
            controller.enqueue(`data: ${JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString()
            })}\n\n`);
          } catch (error) {
            clearInterval(keepAlive);
            removeConnection(userId);
          }
        }, 30000);

        // Cleanup cuando se cierra la conexión
        req.signal?.addEventListener('abort', () => {
          clearInterval(keepAlive);
          removeConnection(userId);
          try {
            controller.close();
          } catch (error) {
            // Conexión ya cerrada
          }
        });
      },

      cancel() {
        removeConnection(userId);
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
    console.error('Error en SSE endpoint:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
