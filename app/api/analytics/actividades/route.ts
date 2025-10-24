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

    // Obtener métricas de actividades asignadas por el usuario
    const actividadesAsignadas = await prisma.actividad.findMany({
      where: {
        usuario_id: currentUser.id
      },
      include: {
        usuarioAsignado: true
      }
    });

    // Obtener métricas de actividades asignadas al usuario
    const actividadesRecibidas = await prisma.actividad.findMany({
      where: {
        usuario_asignado_id: currentUser.id
      },
      include: {
        usuario: true
      }
    });

    // Calcular métricas para actividades asignadas por el usuario
    const totalAsignadas = actividadesAsignadas.length;
    const completadasAsignadas = actividadesAsignadas.filter(a => a.estado === 'terminado').length;
    const pendientesAsignadas = actividadesAsignadas.filter(a => a.estado !== 'terminado').length;
    const vencidasAsignadas = actividadesAsignadas.filter(a => 
      a.estado !== 'terminado' && new Date(a.fechaTermino) < new Date()
    ).length;

    // Calcular métricas para actividades asignadas al usuario
    const totalRecibidas = actividadesRecibidas.length;
    const completadasRecibidas = actividadesRecibidas.filter(a => a.estado === 'terminado').length;
    const pendientesRecibidas = actividadesRecibidas.filter(a => a.estado !== 'terminado').length;
    const vencidasRecibidas = actividadesRecibidas.filter(a => 
      a.estado !== 'terminado' && new Date(a.fechaTermino) < new Date()
    ).length;

    // Calcular promedio de completamiento
    const totalActividades = totalAsignadas + totalRecibidas;
    const totalCompletadas = completadasAsignadas + completadasRecibidas;
    const promedioCompletamiento = totalActividades > 0 
      ? Math.round((totalCompletadas / totalActividades) * 100) 
      : 0;

    const metrics = {
      totalAsignadas,
      totalRecibidas,
      completadasAsignadas,
      completadasRecibidas,
      pendientesAsignadas,
      pendientesRecibidas,
      vencidasAsignadas,
      vencidasRecibidas,
      promedioCompletamiento
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Error obteniendo métricas de actividades:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}