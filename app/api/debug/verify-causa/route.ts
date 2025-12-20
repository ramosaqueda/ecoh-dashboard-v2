
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const causes = await prisma.causa.findMany({
      take: 1,
      include: {
        Fiscal: { select: { id: true, nombre: true } },
        Delito: { select: { id: true, nombre: true } },
        Abogado: { select: { id: true, nombre: true } },
        Analista: { select: { id: true, nombre: true } },
        Atvt: { select: { id: true, nombre: true } },
        origenes_causa: { select: { id: true, nombre: true, color: true } },
        estados_causa: { select: { id: true, nombre: true, codigo: true, color: true } },
        _count: {
          select: {
            CausasImputados: true,
            CausasRelacionadas_CausasRelacionadas_causaMadreIdToCausa: true,
            CausasRelacionadas_CausasRelacionadas_causaAristaIdToCausa: true
          }
        }
      }
    });
    return NextResponse.json({ success: true, count: causes.length, sample: causes[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}
