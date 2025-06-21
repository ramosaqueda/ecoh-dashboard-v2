// app/api/reportes/fiscal-causas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalId = searchParams.get('fiscalId');

    // Consulta principal para obtener todos los fiscales con sus causas e imputados
    const whereClause = fiscalId ? { id: parseInt(fiscalId) } : {};

    const fiscales = await prisma.fiscal.findMany({
      where: whereClause,
      include: {
        causas: {
          include: {
            imputados: {
              include: {
                imputado: {
                  select: {
                    id: true,
                    nombreSujeto: true,
                    docId: true,
                  }
                },
                cautelar: {
                  select: {
                    id: true,
                    nombre: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Procesar los datos para el formato requerido
    const datosReporte = fiscales.map(fiscal => ({
      id: fiscal.id,
      nombre: fiscal.nombre,
      causas: fiscal.causas.map(causa => ({
        id: causa.id,
        denominacionCausa: causa.denominacionCausa,
        ruc: causa.ruc,
        fechaDelHecho: causa.fechaDelHecho,
        rit: causa.rit,
        numeroIta: causa.numeroIta,
        numeroPpp: causa.numeroPpp,
        observacion: causa.observacion,
        imputados: causa.imputados.map(causaImputado => ({
          id: causaImputado.imputado.id,
          nombreSujeto: causaImputado.imputado.nombreSujeto,
          docId: causaImputado.imputado.docId,
          formalizado: causaImputado.formalizado,
          fechaFormalizacion: causaImputado.fechaFormalizacion,
          cautelar: causaImputado.cautelar ? {
            id: causaImputado.cautelar.id,
            nombre: causaImputado.cautelar.nombre
          } : null,
          // Identificar si tiene prisión preventiva o internación provisoria
          tienePrisionPreventiva: causaImputado.cautelar?.nombre?.toLowerCase().includes('prisión preventiva') || false,
          tieneInternacionProvisoria: causaImputado.cautelar?.nombre?.toLowerCase().includes('internación provisoria') || false
        }))
      }))
    }));

    // Calcular estadísticas generales
    const estadisticas = {
      totalFiscales: fiscales.length,
      totalCausas: fiscales.reduce((acc, fiscal) => acc + fiscal.causas.length, 0),
      totalImputados: fiscales.reduce((acc, fiscal) => 
        acc + fiscal.causas.reduce((accCausas, causa) => accCausas + causa.imputados.length, 0), 0),
      imputadosFormalizados: fiscales.reduce((acc, fiscal) => 
        acc + fiscal.causas.reduce((accCausas, causa) => 
          accCausas + causa.imputados.filter(imp => imp.formalizado).length, 0), 0),
      conPrisionPreventiva: fiscales.reduce((acc, fiscal) => 
        acc + fiscal.causas.reduce((accCausas, causa) => 
          accCausas + causa.imputados.filter(imp => 
            imp.cautelar?.nombre?.toLowerCase().includes('prisión preventiva')).length, 0), 0),
      conInternacionProvisoria: fiscales.reduce((acc, fiscal) => 
        acc + fiscal.causas.reduce((accCausas, causa) => 
          accCausas + causa.imputados.filter(imp => 
            imp.cautelar?.nombre?.toLowerCase().includes('internación provisoria')).length, 0), 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        fiscales: datosReporte,
        estadisticas
      }
    });

  } catch (error) {
    console.error('Error al generar reporte fiscal:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}

// Endpoint específico para obtener solo las estadísticas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fiscalIds } = body; // Array de IDs de fiscales para filtrar

    const whereClause = fiscalIds && fiscalIds.length > 0 ? 
      { id: { in: fiscalIds } } : {};

    // Consulta optimizada para solo estadísticas
    const estadisticas = await prisma.fiscal.findMany({
      where: whereClause,
      select: {
        id: true,
        nombre: true,
        _count: {
          select: {
            causas: true
          }
        },
        causas: {
          select: {
            id: true,
            denominacionCausa: true,
            _count: {
              select: {
                imputados: true
              }
            },
            imputados: {
              select: {
                formalizado: true,
                cautelar: {
                  select: {
                    nombre: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const resumenPorFiscal = estadisticas.map(fiscal => {
      const totalCausas = fiscal._count.causas;
      const totalImputados = fiscal.causas.reduce((acc, causa) => acc + causa._count.imputados, 0);
      const formalizados = fiscal.causas.reduce((acc, causa) => 
        acc + causa.imputados.filter(imp => imp.formalizado).length, 0);
      const prisionPreventiva = fiscal.causas.reduce((acc, causa) => 
        acc + causa.imputados.filter(imp => 
          imp.cautelar?.nombre?.toLowerCase().includes('prisión preventiva')).length, 0);
      const internacionProvisoria = fiscal.causas.reduce((acc, causa) => 
        acc + causa.imputados.filter(imp => 
          imp.cautelar?.nombre?.toLowerCase().includes('internación provisoria')).length, 0);

      return {
        fiscalId: fiscal.id,
        nombreFiscal: fiscal.nombre,
        totalCausas,
        totalImputados,
        formalizados,
        prisionPreventiva,
        internacionProvisoria,
        causasConMedidasPrivativas: fiscal.causas.filter(causa => 
          causa.imputados.some(imp => 
            imp.cautelar?.nombre?.toLowerCase().includes('prisión preventiva') ||
            imp.cautelar?.nombre?.toLowerCase().includes('internación provisoria')
          )
        ).length
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        resumenPorFiscal,
        totalesGenerales: {
          totalFiscales: estadisticas.length,
          totalCausas: resumenPorFiscal.reduce((acc, fiscal) => acc + fiscal.totalCausas, 0),
          totalImputados: resumenPorFiscal.reduce((acc, fiscal) => acc + fiscal.totalImputados, 0),
          totalFormalizados: resumenPorFiscal.reduce((acc, fiscal) => acc + fiscal.formalizados, 0),
          totalPrisionPreventiva: resumenPorFiscal.reduce((acc, fiscal) => acc + fiscal.prisionPreventiva, 0),
          totalInternacionProvisoria: resumenPorFiscal.reduce((acc, fiscal) => acc + fiscal.internacionProvisoria, 0)
        }
      }
    });

  } catch (error) {
    console.error('Error al generar estadísticas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      }, 
      { status: 500 }
    );
  }
}
 