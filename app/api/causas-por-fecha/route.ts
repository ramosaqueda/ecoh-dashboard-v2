// src/app/api/causas-por-fecha/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Los parámetros fechaInicio y fechaFin son requeridos' },
        { status: 400 }
      );
    }

    // Convertir a fechas para comparar
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    
    // Ajustar fechaFinDate para incluir todo el día
    fechaFinDate.setHours(23, 59, 59, 999);

    // Buscar las causas con sus imputados y cautelares en el rango de fechas
    const causas = await prisma.causa.findMany({
      where: {
        fechaDelHecho: {
          gte: fechaInicioDate,
          lte: fechaFinDate,
        },
      },
      select: {
        id: true,
        denominacionCausa: true,
        ruc: true,
        fechaDelHecho: true,
        delito: {
          select: {
            nombre: true,
          },
        },
        comuna: {
          select: {
            nombre: true,
          },
        },
        imputados: {
          select: {
            formalizado: true,
            fechaFormalizacion: true,
            cautelar: {
              select: {
                id: true,
                nombre: true,
              },
            },
            imputado: {
              select: {
                id: true,
                nombreSujeto: true,
                docId: true,
                alias: true,
                nacionalidad: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Formatear los datos para la respuesta
    const resultados = causas.map(causa => ({
      id: causa.id,
      denominacionCausa: causa.denominacionCausa,
      ruc: causa.ruc,
      fechaDelHecho: causa.fechaDelHecho,
      delito: causa.delito?.nombre || 'No especificado',
      comuna: causa.comuna?.nombre || 'No especificada',
      imputados: causa.imputados.map(imp => ({
        id: imp.imputado.id,
        nombreSujeto: imp.imputado.nombreSujeto,
        docId: imp.imputado.docId,
        alias: imp.imputado.alias || '',
        nacionalidad: imp.imputado.nacionalidad?.nombre || 'No especificada',
        formalizado: imp.formalizado,
        fechaFormalizacion: imp.fechaFormalizacion,
        medidaCautelar: imp.cautelar?.nombre || 'Sin medida cautelar',
      })),
    }));

    return NextResponse.json({
      data: resultados,
      total: resultados.length,
    });
  } catch (error) {
    console.error('Error al obtener causas por fecha:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}