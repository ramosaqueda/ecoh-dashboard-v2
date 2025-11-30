import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const TipoActividadSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
    areaId: z.number().int().positive('El área es requerida'),
    activo: z.boolean().optional().default(true),
    siglainf: z.string().max(10, 'La sigla no puede exceder 10 caracteres').optional().nullable(),
    reqinforme: z.boolean().optional().default(false)
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const tiposActividad = await prisma.tipoActividad.findMany({
            where: includeInactive ? {} : {
                activo: true
            },
            include: {
                area: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            },
            orderBy: [
                { areaId: 'asc' },
                { nombre: 'asc' }
            ]
        });

        return NextResponse.json(tiposActividad, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error en GET /api/admin/tipo-actividad:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudieron obtener los tipos de actividad' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = TipoActividadSchema.parse(body);

        // Verificar que el área existe
        const areaExiste = await prisma.area.findUnique({
            where: { id: validatedData.areaId }
        });

        if (!areaExiste) {
            return NextResponse.json(
                { error: 'El área especificada no existe' },
                { status: 400 }
            );
        }

        // Verificar si ya existe un tipo con el mismo nombre
        const existingTipo = await prisma.tipoActividad.findFirst({
            where: {
                nombre: {
                    equals: validatedData.nombre.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingTipo) {
            return NextResponse.json(
                { error: 'Ya existe un tipo de actividad con ese nombre' },
                { status: 409 }
            );
        }

        const tipoActividad = await prisma.tipoActividad.create({
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null,
                areaId: validatedData.areaId,
                activo: validatedData.activo,
                siglainf: validatedData.siglainf?.trim() || null,
                reqinforme: validatedData.reqinforme
            },
            include: {
                area: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        });

        return NextResponse.json(tipoActividad, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/admin/tipo-actividad:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo crear el tipo de actividad' },
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
        const validatedData = TipoActividadSchema.parse(body);

        // Verificar que el tipo existe
        const tipoExistente = await prisma.tipoActividad.findUnique({
            where: { id: parseInt(id) }
        });

        if (!tipoExistente) {
            return NextResponse.json(
                { error: 'Tipo de actividad no encontrado' },
                { status: 404 }
            );
        }

        // Verificar que el área existe
        const areaExiste = await prisma.area.findUnique({
            where: { id: validatedData.areaId }
        });

        if (!areaExiste) {
            return NextResponse.json(
                { error: 'El área especificada no existe' },
                { status: 400 }
            );
        }

        // Verificar duplicados (excluyendo el registro actual)
        const duplicado = await prisma.tipoActividad.findFirst({
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
                { error: 'Ya existe otro tipo de actividad con ese nombre' },
                { status: 409 }
            );
        }

        const tipoActualizado = await prisma.tipoActividad.update({
            where: { id: parseInt(id) },
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null,
                areaId: validatedData.areaId,
                activo: validatedData.activo,
                siglainf: validatedData.siglainf?.trim() || null,
                reqinforme: validatedData.reqinforme
            },
            include: {
                area: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        });

        return NextResponse.json(tipoActualizado, { status: 200 });
    } catch (error) {
        console.error('Error en PUT /api/admin/tipo-actividad:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo actualizar el tipo de actividad' },
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
        const tipoExistente = await prisma.tipoActividad.findUnique({
            where: { id: parseInt(id) }
        });

        if (!tipoExistente) {
            return NextResponse.json(
                { error: 'Tipo de actividad no encontrado' },
                { status: 404 }
            );
        }

        // Soft delete - solo marcar como inactivo
        await prisma.tipoActividad.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });

        return NextResponse.json({
            message: 'Tipo de actividad desactivado correctamente'
        }, { status: 200 });
    } catch (error) {
        console.error('Error en DELETE /api/admin/tipo-actividad:', error);

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo desactivar el tipo de actividad' },
            { status: 500 }
        );
    }
}
