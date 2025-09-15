// /app/api/actividades/notify/check/route.ts
// Endpoint para verificar notificaciones pendientes

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Buscar usuario en BD
    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json({ notifications: [] });
    }

    // 🔧 Reducir ventana a 15 segundos para evitar duplicados
    const cutoffTime = new Date(Date.now() - 15000); // 15 segundos

    const actividadesNuevas = await prisma.actividad.findMany({
      where: {
        usuario_asignado_id: usuario.id,
        createdAt: {
          gte: cutoffTime
        },
        // No incluir actividades que el mismo usuario creó
        NOT: {
          usuario_id: usuario.id
        }
      },
      include: {
        causa: { select: { ruc: true } },
        tipoActividad: { select: { nombre: true } },
        usuario: { select: { nombre: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const notifications = actividadesNuevas.map(actividad => ({
      id: `actividad-nueva-${actividad.id}-${actividad.createdAt.getTime()}`,
      title: 'Nueva Actividad Asignada',
      message: `${actividad.usuario.nombre} te ha asignado la actividad "${actividad.tipoActividad.nombre}" para la causa ${actividad.causa.ruc}`,
      type: 'actividad_nueva',
      actividadId: actividad.id,
      causaRuc: actividad.causa.ruc,
      tipoActividad: actividad.tipoActividad.nombre,
      actionUrl: `/dashboard/actividades?highlight=${actividad.id}`,
      timestamp: actividad.createdAt.toISOString()
    }));

    if (notifications.length > 0) {
      console.log(`🔔 Check: ${notifications.length} notificaciones para ${usuario.nombre}`);
    }

    return NextResponse.json({
      notifications,
      timestamp: new Date().toISOString(),
      userId: usuario.id,
      userName: usuario.nombre
    });

  } catch (error) {
    console.error('Error en check notifications:', error);
    return NextResponse.json({ notifications: [] });
  }
}
