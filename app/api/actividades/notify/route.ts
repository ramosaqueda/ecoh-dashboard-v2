// /app/api/actividades/notify/route.ts
// Endpoint súper simple para generar notificación inmediata

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const { actividadId, usuarioAsignadoClerkId } = await req.json();

    // Obtener datos de la actividad
    const actividad = await prisma.actividad.findUnique({
      where: { id: parseInt(actividadId) },
      include: {
        causa: { select: { ruc: true } },
        tipoActividad: { select: { nombre: true } },
        usuarioAsignado: { 
          select: { 
            clerk_id: true, 
            nombre: true 
          } 
        }
      }
    });

    if (!actividad) {
      return NextResponse.json({ message: 'Actividad no encontrada' }, { status: 404 });
    }

    // Verificar que el usuario asignado coincida
    if (actividad.usuarioAsignado?.clerk_id !== usuarioAsignadoClerkId) {
      return NextResponse.json({ message: 'Usuario no coincide' }, { status: 400 });
    }

    // Crear la notificación que se enviará al cliente
    // ✅ Construir mensaje apropiado según si tiene causa o no
    const message = actividad.causa
      ? `Se te ha asignado la actividad "${actividad.tipoActividad.nombre}" para la causa ${actividad.causa.ruc}`
      : `Se te ha asignado la actividad de apoyo "${actividad.tipoActividad.nombre}"`;

    const notification = {
      id: `actividad-nueva-${actividadId}-${Date.now()}`,
      title: 'Nueva Actividad Asignada',
      message,
      type: 'actividad_nueva',
      timestamp: new Date().toISOString(),
      actividadId: parseInt(actividadId),
      causaRuc: actividad.causa?.ruc || null, // ✅ Usar optional chaining
      tipoActividad: actividad.tipoActividad.nombre,
      actionUrl: `/dashboard/todo?highlight=${actividadId}`
    };

    console.log(`📬 Preparando notificación para usuario: ${actividad.usuarioAsignado?.nombre ?? ''}`);

    return NextResponse.json({
      success: true,
      notification,
      targetUser: {
        clerkId: usuarioAsignadoClerkId,
        nombre: actividad.usuarioAsignado?.nombre ?? ''
      }
    });

  } catch (error) {
    console.error('Error en notify endpoint:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}
