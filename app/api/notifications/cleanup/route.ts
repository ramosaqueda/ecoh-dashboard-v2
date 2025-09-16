// ==========================================
// ARCHIVO: /app/api/notifications/cleanup/route.ts
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// POST - Limpiar notificaciones expiradas y antiguas
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Eliminar notificaciones expiradas o descartadas hace más de 30 días
    const deleteResult = await prisma.notification.deleteMany({
      where: {
        userId: usuario.id,
        OR: [
          {
            // Notificaciones expiradas
            expiresAt: {
              lt: now
            }
          },
          {
            // Notificaciones descartadas hace más de 30 días
            dismissed: true,
            createdAt: {
              lt: thirtyDaysAgo
            }
          }
        ]
      }
    });

    console.log(`🧹 Limpieza completada para usuario ${usuario.nombre}: ${deleteResult.count} notificaciones eliminadas`);

    return NextResponse.json({
      message: 'Limpieza completada',
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('Error en POST /api/notifications/cleanup:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// ==========================================
// ARCHIVO: /app/api/notifications/stats/route.ts
// ==========================================

// GET - Obtener estadísticas de notificaciones
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Estadísticas generales
    const [
      totalNotifications,
      unreadNotifications,
      dismissedNotifications,
      expiredNotifications,
      notificationsByType,
      notificationsByPriority,
      recentNotifications
    ] = await Promise.all([
      // Total de notificaciones (no descartadas)
      prisma.notification.count({
        where: {
          userId: usuario.id,
          dismissed: false
        }
      }),

      // Notificaciones no leídas
      prisma.notification.count({
        where: {
          userId: usuario.id,
          dismissed: false,
          read: false
        }
      }),

      // Notificaciones descartadas
      prisma.notification.count({
        where: {
          userId: usuario.id,
          dismissed: true
        }
      }),

      // Notificaciones expiradas
      prisma.notification.count({
        where: {
          userId: usuario.id,
          dismissed: false,
          expiresAt: {
            lt: new Date()
          }
        }
      }),

      // Por tipo
      prisma.notification.groupBy({
        by: ['type'],
        where: {
          userId: usuario.id,
          dismissed: false
        },
        _count: {
          _all: true
        }
      }),

      // Por prioridad
      prisma.notification.groupBy({
        by: ['priority'],
        where: {
          userId: usuario.id,
          dismissed: false
        },
        _count: {
          _all: true
        }
      }),

      // Notificaciones de los últimos 7 días
      prisma.notification.count({
        where: {
          userId: usuario.id,
          dismissed: false,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Formatear estadísticas por tipo
    const typeStats = notificationsByType.reduce((acc, item) => {
      acc[item.type] = item._count._all;
      return acc;
    }, {} as Record<string, number>);

    // Formatear estadísticas por prioridad
    const priorityStats = notificationsByPriority.reduce((acc, item) => {
      acc[item.priority] = item._count._all;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        total: totalNotifications,
        unread: unreadNotifications,
        dismissed: dismissedNotifications,
        expired: expiredNotifications,
        recent: recentNotifications
      },
      byType: {
        actividad_nueva: typeStats.actividad_nueva || 0,
        actividad_actualizada: typeStats.actividad_actualizada || 0
      },
      byPriority: {
        critica: priorityStats.critica || 0,
        alta: priorityStats.alta || 0,
        medio: priorityStats.medio || 0,
        bajo: priorityStats.bajo || 0
      },
      metadata: {
        userId: usuario.id,
        userName: usuario.nombre,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en GET /api/notifications/stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}