// app/api/causas-victimas/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interface para Next.js 15
interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Props) {
  try {
    // Await params antes de usar (Next.js 15)
    const { id } = await params;
    const victimaId = parseInt(id);

    console.log('🔍 GET /api/causas-victimas/[id] - Obteniendo causas para víctima:', victimaId);

    if (isNaN(victimaId)) {
      return NextResponse.json(
        { error: 'ID de víctima inválido' },
        { status: 400 }
      );
    }

    // Consulta simple y directa a CausasVictimas: SELECT * FROM "CausasVictimas" WHERE "victimaId" = id
    const causasVictima = await prisma.causasVictimas.findMany({
      where: {
        victimaId: victimaId
      },
      include: {
        causa: {
          include: {
            delito: true,
            tribunal: true
          }
        }
      }
    });

    console.log(`✅ Encontradas ${causasVictima.length} causas para víctima ${victimaId}`);
    return NextResponse.json(causasVictima);
  } catch (error) {
    console.error('💥 Error fetching victima causas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para verificar relación específica
export async function PATCH(req: Request, { params }: Props) {
  try {
    // Await params antes de usar (Next.js 15)
    const { id } = await params;
    const victimaId = parseInt(id);
    const data = await req.json();
    const { causaId } = data;

    console.log('🔄 PATCH /api/causas-victimas/[id] - Verificando relación:', {
      victimaId,
      causaId
    });

    if (!causaId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la causa' },
        { status: 400 }
      );
    }

    if (isNaN(victimaId) || isNaN(parseInt(causaId))) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    // Solo verificamos que la relación existe (no hay campos actualizables)
    const existing = await prisma.causasVictimas.findUnique({
      where: {
        causaId_victimaId: {
          causaId: parseInt(causaId),
          victimaId: victimaId
        }
      },
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
        },
        victima: {
          select: {
            id: true,
            nombreVictima: true,
            docId: true
          }
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'La relación causa-víctima no existe' },
        { status: 404 }
      );
    }

    console.log('✅ Relación encontrada');
    return NextResponse.json(existing);
  } catch (error) {
    console.error('💥 Error en PATCH:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para verificar relación causa-víctima
export async function PUT(req: Request, { params }: Props) {
  try {
    // Await params antes de usar (Next.js 15)
    const { id } = await params;
    const victimaId = parseInt(id);
    const data = await req.json();
    const { causaId } = data;
    
    console.log('🔄 PUT /api/causas-victimas/[id] - Verificando relación:', {
      victimaId,
      causaId
    });

    if (!causaId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la causa' },
        { status: 400 }
      );
    }

    if (isNaN(victimaId) || isNaN(parseInt(causaId))) {
      return NextResponse.json(
        { error: 'IDs inválidos' },
        { status: 400 }
      );
    }

    // Verificar que la relación existe
    const existing = await prisma.causasVictimas.findUnique({
      where: {
        causaId_victimaId: {
          causaId: parseInt(causaId),
          victimaId: victimaId
        }
      },
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
        },
        victima: {
          select: {
            id: true,
            nombreVictima: true,
            docId: true
          }
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'La relación causa-víctima no existe' },
        { status: 404 }
      );
    }

    console.log('✅ Relación encontrada');
    return NextResponse.json(existing);
  } catch (error) {
    console.error('💥 Error en PUT:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}