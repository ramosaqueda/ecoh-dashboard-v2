import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const OrigenCausaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().nullable(),
    activo: z.boolean().optional().default(true),
    color: z.string().max(7, 'El color debe ser un código hexadecimal válido').optional().nullable()
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const origenes = await prisma.origenCausa.findMany({
            where: includeInactive ? {} : {
                activo: true
            },
            orderBy: [
                { activo: 'desc' },
                { nombre: 'asc' }
            ]
        });

        return NextResponse.json(origenes, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error en GET /api/admin/origen-causa:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudieron obtener los orígenes de causa' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = OrigenCausaSchema.parse(body);

        // Verificar si ya existe un origen con el mismo nombre
        const existingOrigen = await prisma.origenCausa.findFirst({
            where: {
                nombre: {
                    equals: validatedData.nombre.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (existingOrigen) {
            return NextResponse.json(
                { error: 'Ya existe un origen de causa con ese nombre' },
                { status: 409 }
            );
        }

        const nuevoOrigen = await prisma.origenCausa.create({
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null,
                color: validatedData.color || null,
                activo: validatedData.activo
            }
        });

        return NextResponse.json(nuevoOrigen, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/admin/origen-causa:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo crear el origen de causa' },
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
        const validatedData = OrigenCausaSchema.parse(body);

        // Verificar que el origen existe
        const origenExistente = await prisma.origenCausa.findUnique({
            where: { id: parseInt(id) }
        });

        if (!origenExistente) {
            return NextResponse.json(
                { error: 'Origen de causa no encontrado' },
                { status: 404 }
            );
        }

        // Verificar duplicados (excluyendo el registro actual)
        const duplicado = await prisma.origenCausa.findFirst({
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
                { error: 'Ya existe otro origen de causa con ese nombre' },
                { status: 409 }
            );
        }

        const origenActualizado = await prisma.origenCausa.update({
            where: { id: parseInt(id) },
            data: {
                nombre: validatedData.nombre.trim(),
                descripcion: validatedData.descripcion?.trim() || null,
                color: validatedData.color || null,
                activo: validatedData.activo
            }
        });

        return NextResponse.json(origenActualizado, { status: 200 });
    } catch (error) {
        console.error('Error en PUT /api/admin/origen-causa:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo actualizar el origen de causa' },
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

        // Verificar que el origen existe
        const origenExistente = await prisma.origenCausa.findUnique({
            where: { id: parseInt(id) }
        });

        if (!origenExistente) {
            return NextResponse.json(
                { error: 'Origen de causa no encontrado' },
                { status: 404 }
            );
        }

        // Soft delete - solo marcar como inactivo
        await prisma.origenCausa.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        });

        return NextResponse.json({
            message: 'Origen de causa desactivado correctamente'
        }, { status: 200 });
    } catch (error) {
        console.error('Error en DELETE /api/admin/origen-causa:', error);

        return NextResponse.json(
            { error: 'Error interno del servidor', message: 'No se pudo desactivar el origen de causa' },
            { status: 500 }
        );
    }
}
