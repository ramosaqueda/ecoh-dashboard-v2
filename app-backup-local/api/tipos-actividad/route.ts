import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const tiposActividad = await prisma.tipoActividad.findMany({
      where: {
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
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(tiposActividad);
  } catch (error) {
    console.error('Error en GET /api/tipos-actividad:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const tipoActividad = await prisma.tipoActividad.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        areaId: data.areaId,
        activo: true
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
    console.error('Error en POST /api/tipos-actividad:', error);
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const data = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    const tipoActividad = await prisma.tipoActividad.update({
      where: { id: Number(id) },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        areaId: data.areaId,
        activo: data.activo
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

    return NextResponse.json(tipoActividad);
  } catch (error) {
    console.error('Error en PUT /api/tipos-actividad:', error);
    
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID no proporcionado' },
        { status: 400 }
      );
    }

    // Soft delete - solo marcar como inactivo
    await prisma.tipoActividad.update({
      where: { id: Number(id) },
      data: { activo: false }
    });

    return NextResponse.json({
      message: 'Tipo de actividad desactivado correctamente'
    });
  } catch (error) {
    console.error('Error en DELETE /api/tipos-actividad:', error);
   
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}