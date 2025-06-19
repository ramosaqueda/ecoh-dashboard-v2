import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const TipoOrganizacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional()
});

export async function GET() {
  try {
    const tipos = await prisma.tipoOrganizacion.findMany();
    return NextResponse.json(tipos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = TipoOrganizacionSchema.parse(body);

    const tipo = await prisma.tipoOrganizacion.create({
      data: validatedData
    });

    return NextResponse.json(tipo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
