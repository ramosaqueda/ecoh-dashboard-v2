// app/api/telefonos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const telefonos = await prisma.telefono.findMany({
      include: {
        proveedorServicio: {
          select: {
            id: true,
            nombre: true
          }
        },
        ubicacion: {
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

    return NextResponse.json(telefonos);
  } catch (error) {
    console.error('Error al obtener teléfonos:', error);
    return NextResponse.json(
      { error: 'Error al obtener teléfonos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.numeroTelefonico ||
      !body.idProveedorServicio ||
      !body.imei ||
      !body.abonado ||
      !body.id_ubicacion
    ) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const telefono = await prisma.telefono.create({
      data: {
        numeroTelefonico: body.numeroTelefonico,
        idProveedorServicio: parseInt(body.idProveedorServicio),
        imei: body.imei,
        abonado: body.abonado,
        id_ubicacion: parseInt(body.id_ubicacion),
        solicitaTrafico: Boolean(body.solicitaTrafico),
        solicitaImei: Boolean(body.solicitaImei),
        extraccionForense: Boolean(body.extraccionForense),
        enviar_custodia: Boolean(body.enviar_custodia),
        observacion: body.observacion || null
      },
      include: {
        proveedorServicio: {
          select: {
            id: true,
            nombre: true
          }
        },
        ubicacion: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    return NextResponse.json(telefono);
  } catch (error) {
    console.error('Error detallado:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        error: 'Error al crear teléfono',
        details: error.message
      },
      { status: 500 }
    );
  }
}