// app/api/reportes/fiscal/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const fiscales = await prisma.fiscal.findMany({
      select: {
        id: true,
        nombre: true,
        _count: {
          select: {
            causas: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(fiscales);
  } catch (error) {
    console.error('Error al obtener fiscales:', error);
    return NextResponse.json(
      { error: 'Error al cargar la lista de fiscales' },
      { status: 500 }
    );
  }
}