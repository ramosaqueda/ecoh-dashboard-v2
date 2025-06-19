// app/api/organizacion/[id]/miembros/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const MiembroSchema = z.object({
  imputadoId: z.number().int().positive(),
  rol: z.string().optional(),
  fechaIngreso: z.string().transform((str) => new Date(str)),
  fechaSalida: z
    .union([z.string().transform((str) => new Date(str)), z.null()])
    .nullable()
    .optional(),
  activo: z.boolean().default(true)
});

// GET: Obtener todos los miembros de una organización
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);

    // Primero verificamos si la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    const miembros = await prisma.miembrosOrganizacion.findMany({
      where: {
        organizacionId: organizacionId
      },
      include: {
        imputado: true
      },
      orderBy: {
        fechaIngreso: 'desc'
      }
    });

    return NextResponse.json(miembros);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Añadir un nuevo miembro a la organización
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);
    const body = await req.json();
    const validatedData = MiembroSchema.parse(body);

    // Verificar si la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si el imputado existe
    const imputado = await prisma.imputado.findUnique({
      where: { id: validatedData.imputadoId }
    });

    if (!imputado) {
      return NextResponse.json(
        { error: 'Imputado no encontrado' },
        { status: 404 }
      );
    }

    const miembro = await prisma.miembrosOrganizacion.create({
      data: {
        ...validatedData,
        organizacionId
      },
      include: {
        imputado: true
      }
    });

    return NextResponse.json(miembro, { status: 201 });
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

// PUT: Actualizar todos los miembros de la organización
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);
    const body = await req.json();
    
    // Validar el array de miembros
    const miembros = z.array(MiembroSchema).parse(body);

    // Verificar si la organización existe
    const organizacion = await prisma.organizacionDelictual.findUnique({
      where: { id: organizacionId }
    });

    if (!organizacion) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      );
    }

    // Usar una transacción para asegurar la integridad de los datos
    const result = await prisma.$transaction(async (tx) => {
      // 1. Eliminar miembros existentes
      await tx.miembrosOrganizacion.deleteMany({
        where: { organizacionId }
      });

      // 2. Crear los nuevos miembros
      const createdMiembros = await Promise.all(
        miembros.map((miembro) =>
          tx.miembrosOrganizacion.create({
            data: {
              ...miembro,
              organizacionId
            },
            include: {
              imputado: true
            }
          })
        )
      );

      return createdMiembros;
    });

    return NextResponse.json(result);
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

