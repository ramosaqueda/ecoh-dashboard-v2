// app/api/telefonos-causa/route.ts
import { NextResponse } from 'next/server';
import { prisma}  from '@/lib/prisma';

 

export async function GET() {
  try {
    const telefonosCausa = await prisma.telefonoCausa.findMany({
      include: {
        telefono: true,
        causa: true
      }
    });

    return NextResponse.json(telefonosCausa);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener teléfonos-causa' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const telefonoCausa = await prisma.telefonoCausa.create({
      data: {
        idTelefono: body.idTelefono,
        idCausa: body.idCausa
      },
      include: {
        telefono: true,
        causa: true
      }
    });

    return NextResponse.json(telefonoCausa);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear teléfono-causa' },
      { status: 500 }
    );
  }
}
