// app/api/ubicaciones-telefono/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ubicaciones = await prisma.ubicacionTelefono.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(ubicaciones);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener ubicaciones' },
      { status: 500 }
    );
  }
}