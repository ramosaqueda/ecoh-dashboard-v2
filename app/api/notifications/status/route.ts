// /app/api/notifications/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getConnectionStats, isUserConnected } from '@/lib/notifications/server/sseManager';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    const stats = getConnectionStats();
    const userConnected = isUserConnected(userId);

    return NextResponse.json({
      sse: {
        totalConnections: stats.totalConnections,
        connectedUsers: stats.connectedUsers,
        currentUserConnected: userConnected
      },
      user: {
        userId,
        connected: userConnected
      },
      system: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Error en GET /api/notifications/status:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
