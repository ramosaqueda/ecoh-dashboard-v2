import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TipoOrganizacionSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable()
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const tiposOrganizacion = await prisma.tipoOrganizacion.findMany({
            where: includeInactive ? {} : {
                // Note: TipoOrganizacion doesn't have 'activo' field in schema, showing all
            },
            orderBy: {
                nombre: 'asc'
            }
        });

        return NextResponse.json(tiposOrganizacion, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error en GET /api/admin/tipo-organizacion:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudieron obtener los tipos de organización' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = TipoOrganizacionSchema.parse(body);

        // Verificar si ya existe un tipo con el mismo nombre
        const existingTipo = await prisma.tipoOrganizacion.findFirst({
            where: {
                nombre: {
                    equals: validatedData.nombre.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingTipo) {
            return NextResponse.json(
                { error: 'Ya existe un tipo de organización con ese nombre' },
                { status: 409 }
            );
        }

        const tipoOrganizacion = await prisma.tipoOrganizacion.create({
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null
            }
        });

        return NextResponse.json(tipoOrganizacion, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/admin/tipo-organizacion:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo crear el tipo de organización' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID es requerido para actualizar' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const validatedData = TipoOrganizacionSchema.parse(body);

        // Verificar que el tipo existe
        const tipoExistente = await prisma.tipoOrganizacion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!tipoExistente) {
            return NextResponse.json(
                { error: 'Tipo de organización no encontrado' },
                { status: 404 }
            );
        }

        // Verificar duplicados (excluyendo el registro actual)
        const duplicado = await prisma.tipoOrganizacion.findFirst({
            where: {
                nombre: {
                    equals: validatedData.nombre.trim(),
                    mode: 'insensitive'
                },
                id: {
                    not: parseInt(id)
                }
            }
        });

        if (duplicado) {
            return NextResponse.json(
                { error: 'Ya existe otro tipo de organización con ese nombre' },
                { status: 409 }
            );
        }

        const tipoActualizado = await prisma.tipoOrganizacion.update({
            where: { id: parseInt(id) },
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null
            }
        });

        return NextResponse.json(tipoActualizado, { status: 200 });
    } catch (error) {
        console.error('Error en PUT /api/admin/tipo-organizacion:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo actualizar el tipo de organización' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID es requerido para eliminar' },
                { status: 400 }
            );
        }

        // Verificar que el tipo existe
        const tipoExistente = await prisma.tipoOrganizacion.findUnique({
            where: { id: parseInt(id) },
            include: {
                organizaciones: true
            }
        });

        if (!tipoExistente) {
            return NextResponse.json(
                { error: 'Tipo de organización no encontrado' },
                { status: 404 }
            );
        }

        // Verificar si tiene organizaciones asociadas
        if (tipoExistente.organizaciones.length > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar. Existen organizaciones asociadas a este tipo.' },
                { status: 409 }
            );
        }

        await prisma.tipoOrganizacion.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            message: 'Tipo de organización eliminado correctamente'
        }, { status: 200 });
    } catch (error) {
        console.error('Error en DELETE /api/admin/tipo-organizacion:', error);

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo eliminar el tipo de organización' },
            { status: 500 }
        );
    }
}
