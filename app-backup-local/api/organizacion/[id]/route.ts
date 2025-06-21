// app/api/organizacion/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OrganizacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  fechaIdentificacion: z.string().transform((str) => new Date(str)),
  activa: z.boolean().default(true),
  tipoOrganizacionId: z.number().int().positive()
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: {
        id: parseInt((await params).id)
      },
      include: {
        tipoOrganizacion: true,
        miembros: {
          include: {
            imputado: true
          }
        },
        // Incluir causas asociadas
        causas: {
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
                }
              }
            }
          },
          orderBy: {
            fechaAsociacion: 'desc'
          }
        }
      }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(organizacion);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
      const id = parseInt((await params).id);
    const body = await req.json();
    const validatedData = OrganizacionSchema.parse(body);

    const organizacion = await prisma.organizacionDelictual.update({
      where: {
        id: id
      },
      data: validatedData,
      include: {
        tipoOrganizacion: true,
        miembros: {
          include: {
            imputado: true
          }
        },
        // Incluir causas asociadas también en la respuesta de actualización
        causas: {
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
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(organizacion);
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
     
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.organizacionDelictual.delete({
      where: {
        id: parseInt((await params).id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}