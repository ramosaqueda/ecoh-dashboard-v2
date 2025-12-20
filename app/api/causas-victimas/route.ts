import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const CausaVictimaSchema = z.object({
  causaId: z.number().min(1, 'Debe seleccionar una causa'),
  victimaId: z.number().min(1, 'La víctima es requerida')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = CausaVictimaSchema.parse(body);

    // Primero verificamos que existan tanto la causa como la víctima
    const [causa, victima] = await Promise.all([
      prisma.causa.findUnique({
        where: { id: validatedData.causaId }
      }),
      prisma.victima.findUnique({
        where: { id: validatedData.victimaId }
      })
    ]);

    if (!causa || !victima) {
      return NextResponse.json(
        { error: 'Causa o Víctima no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si ya existe la relación
    const existingRelation = await prisma.causasVictimas.findUnique({
      where: {
        causaId_victimaId: {
          causaId: validatedData.causaId,
          victimaId: validatedData.victimaId
        }
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'La víctima ya está asociada a esta causa' },
        { status: 400 }
      );
    }

    const causaVictima = await prisma.causasVictimas.create({
      data: {
        causaId: validatedData.causaId,
        victimaId: validatedData.victimaId
      },
      include: {
        causa: {
          select: {
            ruc: true,
            denominacionCausa: true
          }
        },
        victima: {
          select: {
            nombreVictima: true
          }
        }
      }
    });

    return NextResponse.json(causaVictima, { status: 201 });
  } catch (error) {
    console.error('Error creating CausaVictima:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const causaId = searchParams.get('causaId');
    const victimaId = searchParams.get('victimaId');

    if (!causaId || !victimaId) {
      return NextResponse.json(
        { error: 'Se requieren causaId e victimaId' },
        { status: 400 }
      );
    }

    await prisma.causasVictimas.delete({
      where: {
        causaId_victimaId: {
          causaId: parseInt(causaId),
          victimaId: parseInt(victimaId)
        }
      }
    });

    return NextResponse.json({
      message: 'Relación causa-víctima eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting CausaVictima:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
