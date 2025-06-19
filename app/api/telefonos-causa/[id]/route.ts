// app/api/telefonos-causa/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const telefonoCausa = await prisma.telefonoCausa.findUnique({
      where: {
        id: parseInt((await params).id)
      },
      include: {
        telefono: true,
        causa: {
          select: {
            id: true,
            ruc: true,
            denominacionCausa: true
          }
        }
      }
    });

    if (!telefonoCausa) {
      return NextResponse.json(
        { error: 'Teléfono-causa no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(telefonoCausa);
  } catch (error) {
    console.error('Error en GET telefono-causa:', error);
    return NextResponse.json(
      { error: 'Error al obtener teléfono-causa' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.telefonoCausa.delete({
      where: {
        id: parseInt((await params).id)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Teléfono-causa eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en DELETE telefono-causa:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar teléfono-causa',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
