// app/api/usuarios/[clerkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // ✅ Cambio 1: Import correcto
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> } // ✅ Cambio 2: params es Promise
) {
  try {
    // ✅ Cambio 3: auth() debe ser awaited
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // ✅ Cambio 4: await params antes de usarlo
    const { clerkId } = await params;

    // Obtener usuario de la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { clerk_id: clerkId }, // ✅ Cambio 5: Verificar nombre del campo en tu schema
       
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

// Ejemplo de método PUT si lo necesitas
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { clerkId } = await params;
    const data = await request.json();

    const usuario = await prisma.usuario.update({
      where: { clerk_id: clerkId },
      data: {
        // Campos que quieras actualizar
        nombre: data.nombre,
        email: data.email,
        // ... otros campos
      }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// Ejemplo de método DELETE si lo necesitas
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { clerkId } = await params;

    await prisma.usuario.delete({
      where: { clerk_id: clerkId }
    });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}