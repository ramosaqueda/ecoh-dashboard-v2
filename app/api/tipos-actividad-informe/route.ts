// app/api/tipos-actividad-informe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const tiposActividad = await prisma.tipoActividad.findMany({
      where: {
        reqinforme: true, // Solo tipos que requieren informe
      },
      select: {
        id: true,
        nombre: true,
        siglainf: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(tiposActividad);
  } catch (error) {
    console.error('Error al obtener tipos de actividad con informe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}