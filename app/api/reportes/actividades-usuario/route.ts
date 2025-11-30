import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, startDate, endDate' },
        { status: 400 }
      );
    }

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const actividades = await prisma.actividad.findMany({
      where: {
        usuario_asignado_id: parseInt(userId),
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        tipoActividad: {
          select: { nombre: true }
        },
        causa: {
          select: { 
            ruc: true,
            denominacionCausa: true
          }
        },
        usuarioAsignado: {
          select: { nombre: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedActividades = actividades.map(act => ({
      id: act.id,
      tipoActividad: act.tipoActividad.nombre,
      causa: act.causa ? `${act.causa.ruc} - ${act.causa.denominacionCausa}` : 'Sin Causa',
      estado: act.estado,
      fechaAsignacion: act.createdAt,
      fechaCambioEstado: act.updatedAt,
      usuarioAsignado: act.usuarioAsignado?.nombre || 'Sin Asignar'
    }));

    return NextResponse.json(formattedActividades);
  } catch (error) {
    console.error('Error fetching activity report:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
