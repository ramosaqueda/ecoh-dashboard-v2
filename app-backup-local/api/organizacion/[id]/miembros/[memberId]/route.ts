// app/api/organizacion/[id]/miembros/[memberId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const organizacionId = parseInt((await params).id);
    const memberId = parseInt((await params).memberId);

    // Verificar si el miembro existe y pertenece a la organización
    const miembro = await prisma.miembrosOrganizacion.findFirst({
      where: {
        id: memberId,
        organizacionId: organizacionId
      }
    });

    if (!miembro) {
      return NextResponse.json(
        { error: 'Miembro no encontrado en esta organización' },
        { status: 404 }
      );
    }

    // Eliminar el miembro
    await prisma.miembrosOrganizacion.delete({
      where: {
        id: memberId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}