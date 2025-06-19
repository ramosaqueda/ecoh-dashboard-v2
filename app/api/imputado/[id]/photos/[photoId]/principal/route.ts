// app/api/imputado/[id]/photos/[photoId]/principal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
  
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    // ✅ Await params antes de usarlos
    const { id, photoId } = await params;
    const imputadoId = parseInt(id);
    const photoIdNum = parseInt(photoId);

    if (isNaN(imputadoId) || isNaN(photoIdNum)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    // Resetear todas las fotos a no principal
    await prisma.fotografia.updateMany({
      where: { imputadoId },
      data: { esPrincipal: false }
    });

    // Establecer la nueva foto principal
    const newPrincipal = await prisma.fotografia.update({
      where: {
        id: photoIdNum,
        imputadoId
      },
      data: { esPrincipal: true }
    });

    // Actualizar la referencia en el imputado
    await prisma.imputado.update({
      where: { id: imputadoId },
      data: { fotoPrincipal: newPrincipal.url }
    });

    return NextResponse.json(newPrincipal);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al establecer la foto principal' },
      { status: 500 }
    );
  }
}

// Si tienes un método DELETE en el mismo archivo, debe seguir el mismo patrón:
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    // ✅ Await params antes de usarlos
    const { id, photoId } = await params;
    const imputadoId = parseInt(id);
    const photoIdNum = parseInt(photoId);

    if (isNaN(imputadoId) || isNaN(photoIdNum)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    // Tu lógica de eliminación aquí
    const deletedPhoto = await prisma.fotografia.delete({
      where: {
        id: photoIdNum,
        imputadoId
      }
    });

    return NextResponse.json({ message: 'Foto eliminada correctamente' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}