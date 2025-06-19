import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Usar NextRequest.nextUrl.searchParams
    const yearParam = req.nextUrl.searchParams.get('year');
    
    // Verificar si se seleccionó "todos" o no se proporcionó año
    if (!yearParam || yearParam === 'todos') {
      console.log('Buscando distribución de nacionalidades para todos los años');
      
      // Obtener todos los imputados sin filtrar por año
      const todosLosImputados = await prisma.imputado.findMany({
        select: {
          nacionalidad: {
            select: {
              nombre: true
            }
          }
        }
      });

      // Contar nacionalidades
      const nacionalidadCount: Record<string, number> = {};
      todosLosImputados.forEach(imputado => {
        const nacionalidad = imputado.nacionalidad?.nombre || 'Desconocida';
        nacionalidadCount[nacionalidad] = (nacionalidadCount[nacionalidad] || 0) + 1;
      });

      console.log('Nacionalidades procesadas correctamente para todos los años');
      return NextResponse.json(nacionalidadCount);
    }
    
    // Procesar año específico
    let year = parseInt(yearParam);

    // Si hay problemas con el parsing, usar el año actual
    if (isNaN(year)) {
      console.log('Año proporcionado no válido, usando año actual');
      year = new Date().getFullYear();
    }

    console.log(`Buscando distribución de nacionalidades para el año: ${year}`);

    // Definir rango de fechas para el año
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    // Primero obtener los IDs de las causas dentro del rango de fechas
    const causasDelPeriodo = await prisma.causa.findMany({
      where: {
        fechaDelHecho: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true
      }
    });

    const causaIds = causasDelPeriodo.map(causa => causa.id);
    console.log(`Causas encontradas en el año ${year}: ${causaIds.length}`);

    // Luego obtener los IDs de imputados vinculados a esas causas
    const imputadosCausas = await prisma.causasImputados.findMany({
      where: {
        causaId: {
          in: causaIds
        }
      },
      select: {
        imputadoId: true
      }
    });

    const imputadoIds = imputadosCausas.map(rel => rel.imputadoId);
    console.log(`Imputados encontrados para causas del año ${year}: ${imputadoIds.length}`);

    // Finalmente contar por nacionalidad
    const imputadosConNacionalidad = await prisma.imputado.findMany({
      where: {
        id: {
          in: imputadoIds
        }
      },
      select: {
        nacionalidad: {
          select: {
            nombre: true
          }
        }
      }
    });

    // Contar nacionalidades
    const nacionalidadCount: Record<string, number> = {};
    imputadosConNacionalidad.forEach(imputado => {
      const nacionalidad = imputado.nacionalidad?.nombre || 'Desconocida';
      nacionalidadCount[nacionalidad] = (nacionalidadCount[nacionalidad] || 0) + 1;
    });

    console.log('Nacionalidades procesadas correctamente');
    return NextResponse.json(nacionalidadCount);
  } catch (error) {
    console.error('Error detallado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}