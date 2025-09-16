// ==========================================
// ARCHIVO: /app/api/notifications/route.ts
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para crear notificación
const CreateNotificationSchema = z.object({
  type: z.enum(['actividad_nueva', 'actividad_actualizada']),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  priority: z.enum(['bajo', 'medio', 'alta', 'critica']).default('medio'),
  actividadId: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  expiresAt: z.string().datetime().optional()
});

// GET - Obtener notificaciones del usuario actual
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const onlyUnread = searchParams.get('unread') === 'true';
    const includeExpired = searchParams.get('include_expired') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir filtros
    const where: any = {
      userId: usuario.id,
      dismissed: false // Solo notificaciones no descartadas
    };

    if (onlyUnread) {
      where.read = false;
    }

    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    // Obtener notificaciones con relaciones
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          actividad: {
            include: {
              causa: {
                select: { ruc: true, denominacionCausa: true }
              },
              tipoActividad: {
                select: { nombre: true }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' }, // crítica, alta, medio, bajo
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset
      }),
      prisma.notification.count({ where })
    ]);

    // Obtener estadísticas
    const stats = await prisma.notification.aggregate({
      where: { userId: usuario.id, dismissed: false },
      _count: {
        _all: true,
        read: true
      }
    });

    return NextResponse.json({
      notifications,
      metadata: {
        total,
        limit,
        offset,
        unreadCount: stats._count._all - (stats._count.read || 0),
        hasMore: offset + notifications.length < total
      }
    });

  } catch (error) {
    console.error('Error en GET /api/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva notificación
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = CreateNotificationSchema.parse(body);

    // Verificar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se especifica actividadId, verificar que existe
    if (validatedData.actividadId) {
      const actividad = await prisma.actividad.findUnique({
        where: { id: validatedData.actividadId }
      });

      if (!actividad) {
        return NextResponse.json(
          { error: 'Actividad no encontrada' },
          { status: 404 }
        );
      }
    }

    // Generar ID único
    const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Crear notificación
    const notification = await prisma.notification.create({
      data: {
        id: notificationId,
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        priority: validatedData.priority,
        userId: usuario.id,
        userEmail: usuario.email,
        actividadId: validatedData.actividadId,
        metadata: validatedData.metadata || {},
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null
      },
      include: {
        actividad: {
          include: {
            causa: {
              select: { ruc: true, denominacionCausa: true }
            },
            tipoActividad: {
              select: { nombre: true }
            }
          }
        }
      }
    });

    console.log(`✅ Notificación creada: ${notification.id} para usuario ${usuario.nombre}`);

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Marcar todas como leídas o descartar todas
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { action } = body; // 'mark_all_read' | 'dismiss_all'

    if (action === 'mark_all_read') {
      const result = await prisma.notification.updateMany({
        where: {
          userId: usuario.id,
          dismissed: false,
          read: false
        },
        data: {
          read: true
        }
      });

      return NextResponse.json({
        message: 'Todas las notificaciones marcadas como leídas',
        updated: result.count
      });

    } else if (action === 'dismiss_all') {
      const result = await prisma.notification.updateMany({
        where: {
          userId: usuario.id,
          dismissed: false
        },
        data: {
          dismissed: true
        }
      });

      return NextResponse.json({
        message: 'Todas las notificaciones descartadas',
        updated: result.count
      });

    } else {
      return NextResponse.json(
        { error: 'Acción no válida. Use: mark_all_read | dismiss_all' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error en PATCH /api/notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}