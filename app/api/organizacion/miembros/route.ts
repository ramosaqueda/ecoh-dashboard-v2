import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const MiembroSchema = z.object({
  organizacionId: z.number().int(),
  imputadoId: z.number().int(),
  rol: z.string().optional(),
  fechaIngreso: z.string().transform((str) => new Date(str)),
  fechaSalida: z
    .union([z.string().transform((str) => new Date(str)), z.null()])
    .nullable()
    .optional(),
  activo: z.boolean().default(true)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received data:', body);
    const validatedData = MiembroSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Intentar crear el nuevo miembro
    const miembro = await prisma.miembrosOrganizacion.create({
      data: {
        organizacionId: validatedData.organizacionId,
        imputadoId: validatedData.imputadoId,
        rol: validatedData.rol,
        fechaIngreso: validatedData.fechaIngreso,
        fechaSalida: validatedData.fechaSalida,
        activo: validatedData.activo
      },
      include: {
        organizacion: true,
        imputado: true
      }
    });

    return NextResponse.json(miembro, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Error de validación', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error },
      { status: 500 }
    );
  }
}
