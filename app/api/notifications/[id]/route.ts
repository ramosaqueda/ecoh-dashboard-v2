// ==========================================
// ARCHIVO: /app/api/notifications/[id]/route.ts
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para actualizar notificación
const UpdateNotificationSchema = z.object({
  read: z.boolean().optional(),
  dismissed: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
}).strict();

// GET - Obtener notificación específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Cambio aquí
) {
  try {
    const params = await context.params; // Resolver el Promise
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

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id, // Usar params.id en lugar de params.id directamente
        userId: usuario.id
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

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(notification);

  } catch (error) {
    console.error('Error en GET /api/notifications/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar notificación específica
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Cambio aquí
) {
  try {
    const params = await context.params; // Resolver el Promise
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

    const body = await request.json(); // Corregí "req" por "request"
    const validatedData = UpdateNotificationSchema.parse(body);

    // Verificar que la notificación existe y pertenece al usuario
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id, // Usar params.id
        userId: usuario.id
      }
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar notificación
    const updatedNotification = await prisma.notification.update({
      where: {
        id: params.id // Usar params.id
      },
      data: validatedData,
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

    console.log(`📝 Notificación ${params.id} actualizada para usuario ${usuario.nombre}`);

    return NextResponse.json(updatedNotification);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error en PATCH /api/notifications/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar notificación específica (marca como dismissed)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Cambio aquí
) {
  try {
    const params = await context.params; // Resolver el Promise
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

    // Verificar que la notificación existe y pertenece al usuario
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id, // Usar params.id
        userId: usuario.id
      }
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notificación no encontrada' },
        { status: 404 }
      );
    }

    // Soft delete: marcar como dismissed en lugar de eliminar físicamente
    await prisma.notification.update({
      where: {
        id: params.id // Usar params.id
      },
      data: {
        dismissed: true
      }
    });

    console.log(`🗑️ Notificación ${params.id} descartada para usuario ${usuario.nombre}`);

    return NextResponse.json({
      message: 'Notificación eliminada correctamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/notifications/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}