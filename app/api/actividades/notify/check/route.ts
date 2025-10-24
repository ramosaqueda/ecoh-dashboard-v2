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

    // 🔔 1. Buscar actividades nuevas asignadas a este usuario (como antes)
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

    // 🔔 2. Buscar actividades que ESTE USUARIO creó y que fueron actualizadas recientemente
    const actividadesActualizadas = await prisma.actividad.findMany({
      where: {
        usuario_id: usuario.id, // Actividades que ESTE usuario creó
        updatedAt: {
          gte: cutoffTime
        },
        // Solo si hay un usuario asignado diferente (para evitar auto-notificaciones)
        usuario_asignado_id: {
          not: usuario.id
        },
        // Y que la fecha de actualización sea diferente a la de creación (fue editada)
        NOT: {
          createdAt: {
            equals: prisma.actividad.fields.updatedAt
          }
        }
      },
      include: {
        causa: { select: { ruc: true } },
        tipoActividad: { select: { nombre: true } },
        usuarioAsignado: { select: { nombre: true } }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    const notifications: any[] = [];

    // Notificaciones de nuevas actividades asignadas
    actividadesNuevas.forEach(actividad => {
      notifications.push({
        id: `actividad-nueva-${actividad.id}-${actividad.createdAt.getTime()}`,
        title: 'Nueva Actividad Asignada',
        message: `${actividad.usuario.nombre} te ha asignado la actividad "${actividad.tipoActividad.nombre}" para la causa ${actividad.causa.ruc}`,
        type: 'actividad_nueva',
        actividadId: actividad.id,
        causaRuc: actividad.causa.ruc,
        tipoActividad: actividad.tipoActividad.nombre,
        actionUrl: ` /dashboard/todo?highlight=${actividad.id}`,
        timestamp: actividad.createdAt.toISOString()
      });
    });

    // 🔔 Notificaciones de cambios de estado
    actividadesActualizadas.forEach(actividad => {
      notifications.push({
        id: `actividad-actualizada-${actividad.id}-${actividad.updatedAt.getTime()}`,
        title: 'Actividad Actualizada',
        message: `${actividad.usuarioAsignado?.nombre || 'El usuario asignado'} ha actualizado la actividad "${actividad.tipoActividad.nombre}" para la causa ${actividad.causa.ruc}`,
        type: 'actividad_actualizada', 
        actividadId: actividad.id,
        causaRuc: actividad.causa.ruc,
        tipoActividad: actividad.tipoActividad.nombre,
        actionUrl: ` /dashboard/todo?highlight=${actividad.id}`,
        timestamp: actividad.updatedAt.toISOString()
      });
    });

    if (notifications.length > 0) {
      console.log(`🔔 Check: ${notifications.length} notificaciones para ${usuario.nombre} (${actividadesNuevas.length} nuevas, ${actividadesActualizadas.length} actualizadas)`);
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
