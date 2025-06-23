// app/api/causas-victimas/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { z } from 'zod';



// Schema simple solo con campos que existen
const CausaVictimaSchema = z.object({
  causaId: z.coerce.number().int().positive('causaId debe ser un número positivo'),
  victimaId: z.coerce.number().int().positive('victimaId debe ser un número positivo')
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/causas-victimas - Datos recibidos:', body);
    
    // ✅ Ahora esto funcionará tanto con strings como con numbers
    const validatedData = CausaVictimaSchema.parse(body);
    console.log('Datos validados:', validatedData);

    // Verificar que existan tanto la causa como la víctima
    const [causa, victima] = await Promise.all([
      prisma.causa.findUnique({
        where: { id: validatedData.causaId }
      }),
      prisma.victima.findUnique({
        where: { id: validatedData.victimaId }
      })
    ]);

    if (!causa) {
      return Response.json(
        { message: 'Causa no encontrada' },
        { status: 404 }
      );
    }

    if (!victima) {
      return Response.json(
        { message: 'Víctima no encontrada' },
        { status: 404 }
      );
    }

    // ✅ CORREGIDO: Cambiar causaVictima por causasVictimas
    const existingRelation = await prisma.causasVictimas.findUnique({
      where: {
        causaId_victimaId: {
          causaId: validatedData.causaId,
          victimaId: validatedData.victimaId
        }
      }
    });

    if (existingRelation) {
      return Response.json(
        { message: 'La víctima ya está asociada a esta causa' },
        { status: 409 }
      );
    }

    // ✅ CORREGIDO: Cambiar causaVictima por causasVictimas
    const nuevaRelacion = await prisma.causasVictimas.create({
      data: {
        causaId: validatedData.causaId,
        victimaId: validatedData.victimaId
      },
      include: {
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true,
            rit: true
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

    return Response.json(nuevaRelacion, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Error de validación Zod:', error.errors);
      return Response.json({ 
        message: 'Datos inválidos', 
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }
    
    console.error('Error creating CausasVictimas:', error);
    return Response.json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    }, { status: 500 });
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

    // ✅ CORREGIDO: Ya estaba usando causasVictimas (correcto)
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
    console.error('Error deleting CausasVictimas:', error);

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

    // ✅ CORREGIDO: Ya estaba usando causasVictimas (correcto)
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
    console.error('Error in PUT CausasVictimas:', error);

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}