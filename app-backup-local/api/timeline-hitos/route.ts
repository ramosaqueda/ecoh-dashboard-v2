// app/api/timeline-hitos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Autorización desactivada temporalmente
    const { searchParams } = new URL(request.url);
    const causaId = searchParams.get('causaId');

    if (!causaId) {
      return new NextResponse(JSON.stringify({ error: "Se requiere un ID de causa" }), {
        status: 400,
      });
    }

    const hitos = await prisma.timelineHito.findMany({
      where: {
        causaId: parseInt(causaId),
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    return NextResponse.json(hitos);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Autorización desactivada temporalmente
    const body = await request.json();
    const { titulo, fecha, descripcion, icono, imagenUrl, causaId } = body;

    if (!titulo || !fecha || !causaId) {
      return new NextResponse(JSON.stringify({ error: "Faltan campos requeridos" }), {
        status: 400,
      });
    }

    const hito = await prisma.timelineHito.create({
      data: {
        titulo,
        fecha: new Date(fecha),
        descripcion,
        icono,
        imagenUrl,
        causaId,
      },
    });

    return NextResponse.json(hito);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Autorización desactivada temporalmente
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: "Se requiere un ID" }), {
        status: 400,
      });
    }

    const body = await request.json();
    const { titulo, fecha, descripcion, icono, imagenUrl } = body;

    if (!titulo || !fecha) {
      return new NextResponse(JSON.stringify({ error: "Faltan campos requeridos" }), {
        status: 400,
      });
    }

    const hito = await prisma.timelineHito.update({
      where: {
        id: parseInt(id),
      },
      data: {
        titulo,
        fecha: new Date(fecha),
        descripcion,
        icono,
        imagenUrl,
      },
    });

    return NextResponse.json(hito);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Autorización desactivada temporalmente
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: "Se requiere un ID" }), {
        status: 400,
      });
    }

    await prisma.timelineHito.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ error: "Error al procesar la solicitud" }), { status: 500 });
  }
}