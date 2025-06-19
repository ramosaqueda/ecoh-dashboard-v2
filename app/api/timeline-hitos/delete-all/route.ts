// app/api/timeline-hitos/delete-all/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    // Autorización desactivada temporalmente
    const { searchParams } = new URL(request.url);
    const causaId = searchParams.get('causaId');

    if (!causaId) {
      return new NextResponse(JSON.stringify({ error: "Se requiere un ID de causa" }), {
        status: 400,
      });
    }

    // Eliminar todos los hitos asociados a la causa
    const deleteResult = await prisma.timelineHito.deleteMany({
      where: {
        causaId: parseInt(causaId),
      },
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
  }
}