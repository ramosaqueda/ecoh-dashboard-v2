import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const currentUser = await prisma.usuario.findUnique({
      where: { clerk_id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener datos de los últimos 6 meses
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      // Obtener actividades asignadas en este mes
      const actividadesAsignadas = await prisma.actividad.count({
        where: {
          usuario_id: currentUser.id,
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      });

      // Obtener actividades completadas en este mes
      const actividadesCompletadas = await prisma.actividad.count({
        where: {
          OR: [
            {
              usuario_id: currentUser.id
            },
            {
              usuario_asignado_id: currentUser.id
            }
          ],
          estado: 'terminado',
          updatedAt: {
            gte: date,
            lt: nextMonth
          }
        }
      });

      // Calcular eficiencia
      const eficiencia = actividadesAsignadas > 0 
        ? Math.round((actividadesCompletadas / actividadesAsignadas) * 100)
        : 0;

      months.push({
        periodo: date.toLocaleDateString('es-ES', { 
          month: 'short', 
          year: 'numeric' 
        }),
        asignadas: actividadesAsignadas,
        completadas: actividadesCompletadas,
        eficiencia: eficiencia
      });
    }

    return NextResponse.json(months);

  } catch (error) {
    console.error('Error obteniendo tendencias:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}