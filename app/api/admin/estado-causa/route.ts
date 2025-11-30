import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const EstadoCausaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
    codigo: z.string().min(1, 'El código es requerido').max(20, 'El código no puede exceder 20 caracteres'),
    activo: z.boolean().optional().default(true),
    orden: z.number().int().optional().nullable(),
    color: z.string().max(7, 'El color debe ser un código hexadecimal válido').optional().nullable()
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const estados = await prisma.estadoCausa.findMany({
            where: includeInactive ? {} : {
                activo: true
            },
            orderBy: [
                { orden: 'asc' },
                { nombre: 'asc' }
            ]
        });

        return NextResponse.json(estados, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error en GET /api/admin/estado-causa:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudieron obtener los estados de causa' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = EstadoCausaSchema.parse(body);

        // Verificar si ya existe un estado con el mismo nombre o código
        const existingEstado = await prisma.estadoCausa.findFirst({
            where: {
                OR: [
                    { nombre: { equals: validatedData.nombre.trim(), mode: 'insensitive' } },
                    { codigo: { equals: validatedData.codigo.trim(), mode: 'insensitive' } }
                ]
            }
        });

        if (existingEstado) {
            const conflictField = existingEstado.nombre.toLowerCase() === validatedData.nombre.trim().toLowerCase()
                ? 'nombre'
                : 'código';
            return NextResponse.json(
                { error: `Ya existe un estado de causa con ese ${conflictField}` },
                { status: 409 }
            );
        }

        const nuevoEstado = await prisma.estadoCausa.create({
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null,
                codigo: validatedData.codigo.trim().toUpperCase(),
                activo: validatedData.activo,
                orden: validatedData.orden,
                color: validatedData.color || null
            }
        });

        return NextResponse.json(nuevoEstado, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/admin/estado-causa:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo crear el estado de causa' },
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
        const validatedData = EstadoCausaSchema.parse(body);

        // Verificar que el estado existe
        const estadoExistente = await prisma.estadoCausa.findUnique({
            where: { id: parseInt(id) }
        });

        if (!estadoExistente) {
            return NextResponse.json(
                { error: 'Estado de causa no encontrado' },
                { status: 404 }
            );
        }

        // Verificar duplicados (excluyendo el registro actual)
        const duplicado = await prisma.estadoCausa.findFirst({
            where: {
                OR: [
                    { nombre: { equals: validatedData.nombre.trim(), mode: 'insensitive' } },
                    { codigo: { equals: validatedData.codigo.trim(), mode: 'insensitive' } }
                ],
                id: {
                    not: parseInt(id)
                }
            }
        });

        if (duplicado) {
            const conflictField = duplicado.nombre.toLowerCase() === validatedData.nombre.trim().toLowerCase()
                ? 'nombre'
                : 'código';
            return NextResponse.json(
                { error: `Ya existe otro estado de causa con ese ${conflictField}` },
                { status: 409 }
            );
        }

        const estadoActualizado = await prisma.estadoCausa.update({
            where: { id: parseInt(id) },
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null,
                codigo: validatedData.codigo.trim().toUpperCase(),
                activo: validatedData.activo,
                orden: validatedData.orden,
                color: validatedData.color || null
            }
        });

        return NextResponse.json(estadoActualizado, { status: 200 });
    } catch (error) {
        console.error('Error en PUT /api/admin/estado-causa:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo actualizar el estado de causa' },
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

        // Verificar que el estado existe
        const estadoExistente = await prisma.estadoCausa.findUnique({
            where: { id: parseInt(id) }
        });

        if (!estadoExistente) {
            return NextResponse.json(
                { error: 'Estado de causa no encontrado' },
                { status: 404 }
            );
        }

        // Soft delete - solo marcar como inactivo
        await prisma.estadoCausa.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });

        return NextResponse.json({
            message: 'Estado de causa desactivado correctamente'
        }, { status: 200 });
    } catch (error) {
        console.error('Error en DELETE /api/admin/estado-causa:', error);

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo desactivar el estado de causa' },
            { status: 500 }
        );
    }
}
