
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const causes = await prisma.causa.findMany({
      take: 1,
      include: {
        fiscal: { select: { id: true, nombre: true } },
        delito: { select: { id: true, nombre: true } },
        abogado: { select: { id: true, nombre: true } },
        analista: { select: { id: true, nombre: true } },
        atvt: { select: { id: true, nombre: true } },
        origenCausa: { select: { id: true, nombre: true, color: true } },
        estadoCausa: { select: { id: true, nombre: true, codigo: true, color: true } },
        _count: {
          select: {
            imputados: true,
            causasRelacionadasMadre: true,
            causasRelacionadasArista: true
          }
        }
      }
    });
    return NextResponse.json({ success: true, count: causes.length, sample: causes[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
