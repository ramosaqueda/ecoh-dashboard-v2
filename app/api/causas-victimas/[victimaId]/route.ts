import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ victimaId: string }> }
) {
  try {
    const { victimaId } = await params;

    if (!victimaId) {
      return NextResponse.json(
        { error: 'ID de víctima requerido' },
        { status: 400 }
      );
    }

    const causasVictimas = await prisma.causasVictimas.findMany({
      where: {
        victimaId: parseInt(victimaId)
      },
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true
          }
        }
      }
    });

    const formattedData = causasVictimas.map((cv) => ({
      causaId: cv.causaId,
      victimaId: cv.victimaId,
      causa: cv.causa
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching causas-victimas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
