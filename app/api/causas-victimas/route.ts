// app/api/causas-victimas/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema simple solo con campos que existen
const CausaVictimaSchema = z.object({
  causaId: z.string().min(1, 'Debe seleccionar una causa'),
  victimaId: z.string().min(1, 'La víctima es requerida')
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const causaId = searchParams.get('causaId');
    const victimaId = searchParams.get('victimaId');

    // Si se proporciona causaId, devolver víctimas de esa causa
    if (causaId) {
      const victimasData = await prisma.causasVictimas.findMany({
        where: {
          causaId: parseInt(causaId)
        },
        include: {
          causa: {
            select: {
              id: true,
              ruc: true,
              denominacionCausa: true,
              delito: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              tribunal: {
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

      // Mapeo simple sin campos inexistentes
      const formattedData = victimasData.map((registro) => ({
        causaId: registro.causaId,
        victimaId: registro.victimaId,
        causa: registro.causa,
        victima: registro.victima
      }));

      return NextResponse.json(formattedData);
    }

    // Si se proporciona victimaId, devolver causas de esa víctima
    if (victimaId) {
      console.log('🔍 Obteniendo causas para víctima:', victimaId);
      
      const causasData = await prisma.causasVictimas.findMany({
        where: {
          victimaId: parseInt(victimaId)
        },
        include: {
          causa: {
            include: {
              delito: true,
              tribunal: true
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

      console.log(`✅ Encontradas ${causasData.length} causas para víctima ${victimaId}`);
      return NextResponse.json(causasData);
    }

    // Si no se proporcionan parámetros, devolver lista simple de causas
    const causas = await prisma.causa.findMany({
      select: {
        id: true,
        ruc: true
      }
    });

    return NextResponse.json(causas.map(causa => ({
      causaId: causa.id,
      ruc: causa.ruc
    })));
  } catch (error) {
    console.error('Error detallado:', {
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('POST /api/causas-victimas - Datos recibidos:', body);
    
    const validatedData = CausaVictimaSchema.parse(body);

    // Verificar que existan tanto la causa como la víctima
    const [causa, victima] = await Promise.all([
      prisma.causa.findUnique({
        where: { id: parseInt(validatedData.causaId) }
      }),
      prisma.victima.findUnique({
        where: { id: parseInt(validatedData.victimaId) }
      })
    ]);

    if (!causa || !victima) {
      return NextResponse.json(
        { error: 'Causa o Víctima no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si la relación ya existe
    const existingRelation = await prisma.causasVictimas.findFirst({
      where: {
        causaId: parseInt(validatedData.causaId),
        victimaId: parseInt(validatedData.victimaId)
      }
    });

    if (existingRelation) {
      return NextResponse.json(
        { message: 'Esta víctima ya está asociada a esta causa' },
        { status: 400 }
      );
    }

    // Crear relación simple
    const causaVictima = await prisma.causasVictimas.create({
      data: {
        causaId: parseInt(validatedData.causaId),
        victimaId: parseInt(validatedData.victimaId)
      },
      include: {
        causa: {
          include: {
            delito: true,
            tribunal: true
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

    console.log('✅ Relación creada exitosamente:', causaVictima);
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
        { error: 'Se requieren causaId y victimaId' },
        { status: 400 }
      );
    }

    console.log('🗑️ Eliminando relación causa-víctima:', { causaId, victimaId });

    await prisma.causasVictimas.delete({
      where: {
        causaId_victimaId: {
          causaId: parseInt(causaId),
          victimaId: parseInt(victimaId)
        }
      }
    });

    console.log('✅ Relación eliminada exitosamente');
    return NextResponse.json({
      message: 'Relación causa-víctima eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting CausaVictima:', error);

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'La relación causa-víctima no existe' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const causaId = searchParams.get('causaId');
    const victimaId = searchParams.get('victimaId');

    if (!causaId || !victimaId) {
      return NextResponse.json(
        { error: 'Se requieren causaId y victimaId' },
        { status: 400 }
      );
    }

    console.log('🔄 Verificando relación causa-víctima:', { causaId, victimaId });

    // Como no hay campos actualizables, solo verificamos que la relación existe
    const existing = await prisma.causasVictimas.findUnique({
      where: {
        causaId_victimaId: {
          causaId: parseInt(causaId),
          victimaId: parseInt(victimaId)
        }
      },
      include: {
        causa: {
          include: {
            delito: true,
            tribunal: true
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
    console.error('Error in PUT CausaVictima:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}