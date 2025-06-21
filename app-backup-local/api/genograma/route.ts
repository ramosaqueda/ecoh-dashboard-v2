import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener un genograma por RUC o causaId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ruc = searchParams.get('ruc');
    const causaId = searchParams.get('causaId');

    if (!ruc && !causaId) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro ruc o causaId' },
        { status: 400 }
      );
    }

    let causa;
    // Si tenemos causaId, buscamos directamente el genograma por causaId
    if (causaId) {
      const genograma = await prisma.genograma.findFirst({
        where: {
          causaId: parseInt(causaId),
        },
      });

      if (!genograma) {
        return NextResponse.json(
          { error: 'No se encontró un genograma asociado a esta causa' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        personas: genograma.personas,
        relaciones: genograma.relaciones,
        mermaidCode: genograma.mermaidCode,
      });
    }

    // Si tenemos ruc, primero buscamos la causa
    if (ruc) {
      // Intentar buscar primero por rucCausa directamente en genograma
      let genograma = await prisma.genograma.findFirst({
        where: {
          rucCausa: ruc,
        },
      });

      // Si no encontramos genograma, buscamos la causa por RUC y luego el genograma asociado
      if (!genograma) {
        causa = await prisma.causa.findFirst({
          where: {
            ruc,
          },
        });

        if (!causa) {
          return NextResponse.json(
            { error: 'No se encontró una causa con el RUC proporcionado' },
            { status: 404 }
          );
        }

        genograma = await prisma.genograma.findFirst({
          where: {
            causaId: causa.id,
          },
        });
      }

      if (!genograma) {
        return NextResponse.json(
          { error: 'No se encontró un genograma asociado a esta causa' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        personas: genograma.personas,
        relaciones: genograma.relaciones,
        mermaidCode: genograma.mermaidCode,
      });
    }
  } catch (error) {
    console.error('Error al obtener el genograma:', error);
    return NextResponse.json(
      { error: 'Error al obtener el genograma' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar un genograma
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rucCausa, causaId, personas, relaciones, mermaidCode } = body;

    if ((!rucCausa && !causaId) || !personas || !relaciones) {
      return NextResponse.json(
        { error: 'Son requeridos rucCausa o causaId, y los campos personas y relaciones' },
        { status: 400 }
      );
    }

    let causa;
    const genogramaData: any = {
      personas,
      relaciones,
      mermaidCode,
    };

    // Si se proporciona causaId, usamos esa relación directa
    if (causaId) {
      causa = await prisma.causa.findUnique({
        where: { id: parseInt(causaId) },
      });

      if (!causa) {
        return NextResponse.json(
          { error: 'No se encontró la causa con el ID proporcionado' },
          { status: 404 }
        );
      }

      genogramaData.causaId = parseInt(causaId);
    }

    // Si se proporciona rucCausa, buscamos primero la causa
    if (rucCausa && !causaId) {
      genogramaData.rucCausa = rucCausa;

      // Intentamos encontrar la causa con este RUC
      causa = await prisma.causa.findFirst({
        where: { ruc: rucCausa },
      });

      // Si encontramos la causa, añadimos la relación
      if (causa) {
        genogramaData.causaId = causa.id;
      }
    }

    // Verificar si ya existe un genograma con ese RUC o causaId
    const whereClause: any = {};
    
    if (causaId) {
      whereClause.causaId = parseInt(causaId);
    } else if (rucCausa) {
      whereClause.rucCausa = rucCausa;
    }

    const existingGenograma = await prisma.genograma.findFirst({
      where: whereClause,
    });

    // Crear o actualizar el genograma
    let genograma;
    
    if (existingGenograma) {
      genograma = await prisma.genograma.update({
        where: { id: existingGenograma.id },
        data: genogramaData,
      });
    } else {
      genograma = await prisma.genograma.create({
        data: genogramaData,
      });
    }

    return NextResponse.json({
      message: existingGenograma ? 'Genograma actualizado correctamente' : 'Genograma creado correctamente',
      id: genograma.id,
    });
  } catch (error) {
    console.error('Error al guardar el genograma:', error);
    return NextResponse.json(
      { error: 'Error al guardar el genograma' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un genograma
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ruc = searchParams.get('ruc');
    const causaId = searchParams.get('causaId');
    const id = searchParams.get('id');

    const whereClause: any = {};

    if (id) {
      whereClause.id = parseInt(id);
    } else if (causaId) {
      whereClause.causaId = parseInt(causaId);
    } else if (ruc) {
      whereClause.rucCausa = ruc;
    } else {
      return NextResponse.json(
        { error: 'Se requiere un parámetro id, ruc o causaId' },
        { status: 400 }
      );
    }

    // Verificar que el genograma exista
    const genograma = await prisma.genograma.findFirst({
      where: whereClause,
    });

    if (!genograma) {
      return NextResponse.json(
        { error: 'No se encontró el genograma especificado' },
        { status: 404 }
      );
    }

    // Eliminar el genograma
    await prisma.genograma.delete({
      where: { id: genograma.id },
    });

    return NextResponse.json({
      message: 'Genograma eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar el genograma:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el genograma' },
      { status: 500 }
    );
  }
}