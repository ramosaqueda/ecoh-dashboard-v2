import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el email del usuario desde Clerk
    const userEmail = request.headers.get('x-user-email') || '';

    // Buscar el usuario en la BD para obtener su id numérico
    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: userId },
      select: { id: true }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener estadísticas en paralelo para mejor rendimiento
    const [
      actividadesPendientes,
      notificacionesNoLeidas,
      causasActivas
    ] = await Promise.all([
      // Actividades pendientes del usuario (estado diferente de 'terminado')
      prisma.actividad.count({
        where: {
          usuario: {
            email: userEmail
          },
          estado: {
            not: 'terminado'
          }
        }
      }).catch(() => 0), // Si hay error, retornar 0
      
      // Notificaciones no leídas del usuario
      prisma.notification.count({
        where: {
          userId: usuario.id, // Ahora usando el id numérico del usuario
          read: false
        }
      }).catch(() => 0), // Si hay error, retornar 0
      
      // Causas activas (puedes ajustar el criterio según tu lógica de negocio)
      prisma.causa.count().catch(() => 0) // Si hay error, retornar 0
    ]);

    return NextResponse.json({
      actividadesPendientes,
      notificacionesNoLeidas,
      causasActivas,
      success: true
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    // En caso de error, devolver valores por defecto en lugar de error 500
    return NextResponse.json({
      actividadesPendientes: 0,
      notificacionesNoLeidas: 0,
      causasActivas: 0,
      success: false
    });
  } finally {
    await prisma.$disconnect();
  }
}
