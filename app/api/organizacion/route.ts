// app/api/organizacion/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PaginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  active: z.string().transform(Boolean).optional()
});

const OrganizacionSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  fechaIdentificacion: z.string().transform((str) => new Date(str)),
  activa: z.boolean().default(true),
  tipoOrganizacionId: z.number().int().positive()
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const validated = PaginationSchema.parse(Object.fromEntries(url.searchParams));
    const { page, limit, search, active } = validated;
    
    const skip = (page - 1) * limit;
    
    const where = {
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: 'insensitive' as const } },
          { descripcion: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(typeof active === 'boolean' && { activa: active })
    };

    const [organizaciones, total] = await prisma.$transaction([
      prisma.organizacionDelictual.findMany({
        where,
        include: {
          tipoOrganizacion: true,
          miembros: {
            include: {
              imputado: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.organizacionDelictual.count({ where })
    ]);

    return NextResponse.json({
      data: organizaciones,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parámetros de consulta inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = OrganizacionSchema.parse(body);

    const organizacion = await prisma.organizacionDelictual.create({
      data: validatedData,
      include: {
        tipoOrganizacion: true,
        miembros: {
          include: {
            imputado: true
          }
        }
      }
    });

    return NextResponse.json(organizacion, { status: 201 });
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