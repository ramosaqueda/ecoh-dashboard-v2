// app/api/imputado/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const docId = searchParams.get('docId');

  try {
    if (id) {
      // Obtener un imputado específico con sus relaciones
      const imputado = await prisma.imputado.findUnique({
        where: { id: Number(id) },
        include: {
          nacionalidad: true,
          causas: {
            include: {
              causa: true,
              cautelar: true
            }
          }
        }
      });

      if (imputado) {
        return NextResponse.json(imputado);
      } else {
        return NextResponse.json(
          { message: 'Imputado no encontrado' },
          { status: 404 }
        );
      }
    } else if (docId) {
      console.log(`Buscando imputado por docId: "${docId}"`);
      // Buscar por RUT/DocID (intento exacto primero)
      let imputado = await prisma.imputado.findFirst({
        where: { docId: docId },
        include: { nacionalidad: true }
      });

      // Si no encuentra, intentar limpiar puntos (si el input tiene puntos) o agregar puntos??
      // Para Chile, lo más común es que la BD tenga formato limpio o con puntos.
      // Intentar sin puntos si falla
      if (!imputado) {
         const cleanDocId = docId.replace(/\./g, '');
         if (cleanDocId !== docId) {
             console.log(`Intento sin puntos: "${cleanDocId}"`);
             imputado = await prisma.imputado.findFirst({
                where: { docId: cleanDocId },
                include: { nacionalidad: true }
             });
         }
      }

      // Si aun no encontra, intentar formato base (sin puntos, guion) si aplica?
      // Por ahora solo logs para depurar.
      
      if (imputado) {
        console.log("Imputado encontrado:", imputado.id);
        return NextResponse.json(imputado); 
      } else {
         console.log("Imputado no encontrado");
         return NextResponse.json(
          { message: 'Imputado no encontrado con ese documento' },
          { status: 404 }
        );
      }
    } else {
      // Obtener todos los imputados con sus relaciones
      const imputados = await prisma.imputado.findMany({
        select: {
          id: true,
          nombreSujeto: true,
          docId: true,
          alias: true,
          nacionalidadId: true,
          fotoPrincipal: true,
          nacionalidad: true,
          causas: {
            include: {
              causa: true,
              cautelar: true
            }
          }
        }
      });
      return NextResponse.json(imputados);
    }
  } catch (error) {
    console.error('Error en GET imputados:', error);
    return NextResponse.json(
      { message: 'Error al obtener imputado(s)', error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombreSujeto, docId, nacionalidadId, causaIds } = body;

    // Crear el imputado
    const imputado = await prisma.imputado.create({
      data: {
        nombreSujeto,
        docId,
        nacionalidadId: nacionalidadId ? Number(nacionalidadId) : null,
        // Si se proporcionan causaIds, crear las relaciones
        causas: causaIds
          ? {
              create: causaIds.map((causaId: number) => ({
                causa: {
                  connect: { id: causaId }
                }
              }))
            }
          : undefined
      },
      include: {
        nacionalidad: true,
        causas: {
          include: {
            causa: true
          }
        }
      }
    });

    return NextResponse.json(imputado, { status: 201 });
  } catch (error) {
    console.error('Error en POST imputado:', error);
    return NextResponse.json(
      { message: 'Error al crear imputado', error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { message: 'Se requiere ID para actualizar' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { nombreSujeto, docId, nacionalidadId, causaIds } = body;

    // Primero, eliminar todas las relaciones existentes si se proporcionan nuevas
    if (causaIds) {
      await prisma.causasImputados.deleteMany({
        where: { imputadoId: Number(id) }
      });
    }

    // Actualizar el imputado y sus relaciones
    const imputado = await prisma.imputado.update({
      where: { id: Number(id) },
      data: {
        nombreSujeto,
        docId,
        nacionalidadId: nacionalidadId ? Number(nacionalidadId) : null,
        // Si se proporcionan causaIds, crear las nuevas relaciones
        causas: causaIds
          ? {
              create: causaIds.map((causaId: number) => ({
                causa: {
                  connect: { id: causaId }
                }
              }))
            }
          : undefined
      },
      include: {
        nacionalidad: true,
        causas: {
          include: {
            causa: true
          }
        }
      }
    });

    return NextResponse.json(imputado);
  } catch (error) {
    console.error('Error en PUT imputado:', error);
    return NextResponse.json(
      { message: 'Error al actualizar imputado', error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { message: 'Se requiere ID para eliminar' },
      { status: 400 }
    );
  }

  try {
    // Primero eliminar las relaciones en CausasImputados
    await prisma.causasImputados.deleteMany({
      where: { imputadoId: Number(id) }
    });

    // Luego eliminar el imputado
    await prisma.imputado.delete({
      where: { id: Number(id) }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error en DELETE imputado:', error);
    return NextResponse.json(
      { message: 'Error al eliminar imputado', error },
      { status: 500 }
    );
  }
}
