// app/api/sitios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ajusta la ruta según tu configuración

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const activo = searchParams.get('activo');

    const where: any = {};
    
    if (categoria) {
      // 🔥 CORREGIDO: Usar 'categorias' en lugar de 'categoria'
      where.categorias = categoria;
    }
    
    if (activo !== null) {
      where.activo = activo === 'true';
    }

    const sitios = await prisma.sitios.findMany({
      where,
      orderBy: [
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return NextResponse.json({
      data: sitios,
      total: sitios.length
    });
  } catch (error) {
    console.error('Error al obtener sitios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, url, icono, categoria, orden } = body;

    // Validaciones básicas
    if (!nombre || !descripcion || !url || !icono) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const nuevoSitio = await prisma.sitios.create({
      data: {
        nombre,
        descripcion,
        url,
        icono,
        // 🔥 CORREGIDO: Usar 'categorias' en lugar de 'categoria'
        categorias: categoria,
        orden: orden || null
      }
    });

    return NextResponse.json(nuevoSitio, { status: 201 });
  } catch (error) {
    console.error('Error al crear sitio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}