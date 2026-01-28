import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Obtener RUC desde la URL directamente
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const ruc = pathParts[pathParts.length - 1];  // Último segmento de la URL
    
    console.log("Buscando RUC:", ruc);
    
    if (!ruc) {
      return NextResponse.json(
        { error: 'RUC no proporcionado' },
        { status: 400 }
      );
    }

    const causa = await prisma.causa.findFirst({
      where: { ruc: ruc },
      include: {
        fiscal: true,
        delito: true,
        comuna: true,
        estadoCausa: true,
        imputados: { include: { imputado: true } },
        victimas: { include: { victima: true } }
      }
    });

    if (!causa) {
      return NextResponse.json(
        { error: 'Causa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(causa);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}