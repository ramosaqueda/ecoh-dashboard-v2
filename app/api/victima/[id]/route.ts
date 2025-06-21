// app/api/victima/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const victimaId = parseInt(id);

    if (isNaN(victimaId)) {
      return NextResponse.json(
        { error: 'ID de víctima inválido' },
        { status: 400 }
      );
    }

    const victima = await prisma.victima.findUnique({
      where: {
        id: victimaId
      },
      include: {
        nacionalidad: {
          select: {
            id: true,
            nombre: true,
          }
        },
        // REMOVIDO: fotografias - ya que no existe en el modelo Victima
        causas: {
          include: {
            causa: {
              select: {
                id: true,
                ruc: true,
                denominacionCausa: true,
                tribunal: {
                  select: {
                    id: true,
                    nombre: true
                  }
                },
                delito: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!victima) {
      return NextResponse.json(
        { error: 'Víctima no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(victima);
  } catch (error) {
    console.error('Error fetching victima:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}