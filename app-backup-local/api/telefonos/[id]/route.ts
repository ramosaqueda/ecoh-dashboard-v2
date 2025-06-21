// app/api/telefonos/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const telefono = await prisma.telefono.findUnique({
      where: {
        id: parseInt((await params).id)
      },
      include: {
        proveedorServicio: true,
        ubicacion: true,  // Incluir la ubicación
        telefonosCausa: {
          include: {
            causa: true
          }
        }
      }
    });

    if (!telefono) {
      return NextResponse.json(
        { error: 'Teléfono no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(telefono);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener teléfono' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    // Validación de campos requeridos
    if (!body.idProveedorServicio || !body.imei || !body.abonado || !body.id_ubicacion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Función auxiliar para convertir valores de checkbox
    const convertCheckboxValue = (value: any): boolean | null => {
      if (value === true) return true;
      if (value === false) return false;
      return null;
    };

    const telefono = await prisma.telefono.update({
      where: {
        id: parseInt((await params).id)
      },
      data: {
        numeroTelefonico: body.numeroTelefonico || null,
        proveedorServicio: {
          connect: { id: parseInt(body.idProveedorServicio) }
        },
        imei: body.imei,
        abonado: body.abonado,
        solicitaTrafico: convertCheckboxValue(body.solicitaTrafico),
        solicitaImei: convertCheckboxValue(body.solicitaImei),
        extraccionForense: convertCheckboxValue(body.extraccionForense),
        enviar_custodia: convertCheckboxValue(body.enviar_custodia), // Nuevo campo
        id_ubicacion: parseInt(body.id_ubicacion) as any, // Nuevo campo
        observacion: body.observacion || null
      },
      include: {
        proveedorServicio: {
          select: {
            id: true,
            nombre: true
          }
        },
        ubicacion: {  // Nuevo include para traer los datos de ubicación
          select: {
            id: true,
            nombre: true
          }
        },
        telefonosCausa: {
          include: {
            causa: {
              select: {
                id: true,
                ruc: true,
                denominacionCausa: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(telefono);
  } catch (error) {
    console.error('Error en PUT:', error);
  
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Error al actualizar teléfono',
          details: error.message 
        },
        { status: 500 }
      );
    }
  
    return NextResponse.json(
      {
        error: 'Error al actualizar teléfono',
        details: 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.telefono.delete({
      where: {
        id: parseInt((await params).id)
      }
    });

    return NextResponse.json({ message: 'Teléfono eliminado exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar teléfono' },
      { status: 500 }
    );
  }
}