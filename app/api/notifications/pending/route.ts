// /app/api/notifications/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el usuario existe en la BD
    const usuario = await prisma.usuarios.findUnique({
      where: { clerk_id: userId }
    });

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const since = searchParams.get('since');
    
    // Buscar actividades nuevas asignadas a este usuario desde la fecha especificada
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000); // 1 minuto por defecto

    // Buscar actividades creadas recientemente asignadas a este usuario
    const actividadesNuevas = await prisma.actividad.findMany({
      where: {
        usuario_asignado_id: usuario.id,
        createdAt: {
          gte: sinceDate
        },
        // Asegurarse de que no es una actividad que él mismo creó
        NOT: {
          usuario_id: usuario.id
        }
      },
      include: {
        Causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true
          }
        },
        TipoActividad: {
          select: {
            id: true,
            nombre: true
          }
        },
        usuarios_Actividad_usuario_idTousuarios: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convertir actividades a notificaciones
    const notifications = actividadesNuevas.map(actividad => {
      // ✅ Construir mensaje apropiado según si tiene causa o no
      const message = actividad.Causa
        ? `Se te ha asignado la actividad "${actividad.TipoActividad.nombre}" para la causa ${actividad.Causa.ruc}`
        : `Se te ha asignado la actividad de apoyo "${actividad.TipoActividad.nombre}"`;

      return {
        id: `actividad-nueva-${actividad.id}-${actividad.createdAt.getTime()}`,
        title: 'Nueva Actividad Asignada',
        message,
        type: 'actividad_nueva',
        timestamp: actividad.createdAt.toISOString(),
        actividadId: actividad.id,
        causaRuc: actividad.Causa?.ruc || null, // ✅ Usar optional chaining
        tipoActividad: actividad.TipoActividad.nombre,
        actionUrl: `/dashboard/todo?highlight=${actividad.id}`
      };
    });

    console.log(`📡 Polling check para usuario ${usuario.nombre}: ${notifications.length} notificaciones nuevas`);

    return NextResponse.json({
      notifications,
      timestamp: new Date().toISOString(),
      since: sinceDate.toISOString()
    });

  } catch (error) {
    console.error('Error en GET /api/notifications/pending:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
