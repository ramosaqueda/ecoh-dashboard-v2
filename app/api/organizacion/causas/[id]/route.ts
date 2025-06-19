import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Eliminar una asociación específica entre causa y organización
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

      const id = parseInt((await params).id);

    // Verificar que la asociación existe
    const asociacion = await prisma.causaOrganizacion.findUnique({
      where: { id }
    });

    if (!asociacion) {
      return NextResponse.json(
        { error: 'La asociación especificada no existe' },
        { status: 404 }
      );
    }

    // Eliminar la asociación
    await prisma.causaOrganizacion.delete({
      where: {
        id
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Asociación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar relación causa-organización:', error);
    return NextResponse.json(
      { error: 'Error al eliminar relación causa-organización' },
      { status: 500 }
    );
  }
}