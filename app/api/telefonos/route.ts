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

    // Validación de campos requeridos (numeroTelefonico y NUE son opcionales)
    if (
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

    // Procesar número telefónico: si está vacío o es undefined, usar "no definido"
    const numeroTelefonico = body.numeroTelefonico && body.numeroTelefonico.trim() !== '' 
      ? body.numeroTelefonico 
      : 'no definido';

    const telefono = await prisma.telefono.create({
      data: {
        numeroTelefonico: numeroTelefonico,
        idProveedorServicio: parseInt(body.idProveedorServicio),
        imei: body.imei,
        abonado: body.abonado,
        nue: body.nue || null, // NUEVO CAMPO AGREGADO
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
    if (error instanceof Error) {
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
  
    // fallback si no es una instancia de Error
    console.error('Error desconocido:', error);
  
    return NextResponse.json(
      {
        error: 'Error al crear teléfono',
        details: 'Error desconocido'
      },
      { status: 500 }
    );
  }
}