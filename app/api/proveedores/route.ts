// app/api/proveedores/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      select: {
        id: true,
        nombre: true,
        _count: {
          select: {
            telefonos: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener proveedores',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
